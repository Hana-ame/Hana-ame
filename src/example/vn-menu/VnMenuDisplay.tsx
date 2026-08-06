import { useMemo } from 'react';
import { VnPlayer } from '../../vn';
import type { VnMenu, VnScript } from '../../vn';
import { SCENE_GROUPS } from '../vn-menu/scene-groups';
import { SCENE_COVERS } from '../vn-menu/scene-covers';

// HS 回想菜单 = 一个 layout:'grid' 的 menu scenario（数据驱动，见 docs/ARCHITECTURE.md「界面即剧本」）。
// 支持 #port/<group> 单个角色菜单：`#port/isekai` / `#port/azusa` / `#port/iru`；
// 场景挂在菜单下：`#port/<group>/<scene>`（如 `#port/azusa/azusa_HA1_21`）。#vn-menu[/...] 为兼容别名。
function groupFromHash(): string | null {
  const h = window.location.hash.slice(1);
  const m = /^(vn-menu|port)\/([^/]+)/.exec(h);
  const group = m ? m[2] : null;
  return group && SCENE_GROUPS.some((g) => g.id === group) ? group : null;
}

export function VnMenuDisplay() {
  const group = groupFromHash();

  const menuScript = useMemo<VnScript>(() => {
    const groupTitle = group ? SCENE_GROUPS.find((g) => g.id === group)?.title : undefined;
    const gridMenu: VnMenu = {
      type: 'menu',
      layout: 'grid',
      items: SCENE_GROUPS.filter((g) => group == null || g.id === group).flatMap((g) =>
        g.scenes.map((s) => ({
          id: `#port/${g.id}/${s}`,
          title: SCENE_COVERS[s]?.title ?? s,
          cover: SCENE_COVERS[s]?.cover,
          group: group == null ? g.title : undefined,
        })),
      ),
    };
    const title = groupTitle ?? 'H-Scene 回想';
    return {
      meta: { title, typeSpeed: 0, ui: { title } },
      lines: [gridMenu, { type: 'end', goto: '#vn-title' }],
    };
  }, [group]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer key={group ?? 'all'} script={menuScript} scriptKey="menu" />
    </div>
  );
}

VnMenuDisplay.head = {
  title: 'H-Scene 回想',
  description: '三游戏 77 场景 · 数据驱动 menu · #port/<group> 单角色菜单',
};

export default VnMenuDisplay;
