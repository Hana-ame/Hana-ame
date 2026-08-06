// Hook for reading and writing the current example ID from the URL hash
import { useEffect, useState, useCallback } from 'react';
import { isExample, DEFAULT_EXAMPLE, type Example } from './examples';
import { SCENE_GROUPS } from './vn-menu/scene-groups';

const GROUP_IDS = new Set(SCENE_GROUPS.map((g) => g.id));

/** 嵌套路由解析：#vn-menu/<group>（角色菜单）或 #vn-menu/<group>/<scene>（菜单下的场景）。 */
function resolveHash(h: string): Example {
  if (!h) return DEFAULT_EXAMPLE;
  // 嵌套路由：#vn-menu/<group>[/<scene>]
  if (h.startsWith('vn-menu/')) {
    const seg = h.split('/');
    const group = seg[1];
    const scene = seg[2];
    if (group && GROUP_IDS.has(group)) {
      if (scene && scene.startsWith(`${group}_`) && isExample(`hscene-${scene}`)) {
        return `hscene-${scene}`;
      }
      return 'vn-menu';
    }
  }
  return isExample(h) ? h : DEFAULT_EXAMPLE;
}

export function useHashExample(): Example {
  const compute = useCallback((): Example => resolveHash(window.location.hash.slice(1)), []);

  const [example, setExample] = useState<Example>(compute);

  useEffect(() => {
    const onChange = () => setExample(compute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [compute]);

  return example;
}
