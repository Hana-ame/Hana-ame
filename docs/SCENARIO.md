# 剧本编写指南

## 新增一个场景

1. **写剧本**：`src/vn/scenes/<prefix>/<name>.ts`
   ```ts
   import type { VnScript } from '../../types';
   export const <name>: VnScript = { meta: {...}, lines: [...] };
   ```
2. **建包装组件**：`src/example/hscene/<name>.tsx`
   ```tsx
   import { VnPlayer } from '../../vn';
   import { <name> } from '../../vn/scenes/<prefix>/<name>';
   export default function <name>Scene() {
     return <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
       <VnPlayer script={<name>} scriptKey="<name>" />
     </div>;
   }
   ```
   `scriptKey` 必须等于场景名（否则回想解锁/存档失效）。
3. **注册**：`src/example/examples.ts` 加 `React.lazy` 组件 + 加入 `EXAMPLES` 数组 + 填 `exampleMap`。
   ```ts
   const h<name> = lazy(() => import('./hscene/<name>').then((m) => ({ default: m.default as ComponentType })));
   ```
4. **验证**：`npm run lint` + `npm run test` + `npm run build`（push 后 curl 线上验收）。

## 指令集速查

| 指令 | 作用 |
|------|------|
| `preload` | 声明资源 `{key,url}`；`wait:true` 等加载完，`wait:false` 后台加载 |
| `say` | 对话。`speaker` 空=旁白；`bg`/`cg`/`stand`/`standPos` 带演出；`fadeMs` 淡入；`effect`（`shake`/`flash`） |
| `wait` | 挂起等点击，可带 `effect` |
| `bg` | 背景层 cover 占满 |
| `cg` | CG 层 contain 看全（可设 `meta.ui.cgBox` 包裹框） |
| `choice` | 选项。`options[].to` 跳 label、`set` 写变量、`showWhen` 条件显示 |
| `jump` | 跳 label / `#hash` / `https://` / 场景名；`if` 条件满足才跳 |
| `label` | 跳转标签 |
| `hook` | 异步钩子：内嵌 `run(vn)` 操作 VnHandle，或声明式 `url` fetch；`set` 写回 |
| `audio` | `key` + `channel`（bgm/sfx/voice）+ `loop`/`volume`；`action:'stop'` |
| `menu` | 数据驱动界面：`title`/`list`/`grid` + `items[]` |
| `buttons` | 场景内自定义按钮层：`jump`/`set`/`href` 动作 + 位置/布局；`buttons:[]` 清除 |
| `stand` | 立绘进出场：`show`/`hide` + `effect`（fade/slide-*/zoom）+ `fadeMs` |
| `transition` | 全屏转场：`fade`/`wipe-*`/`circle`/`slide-*`/`zoom`，播完自动继续 |
| `video` | 全屏视频：`loop`/`volume`/`muted`/`fit`/`wait`；`action:'stop'` |
| `end` | 结束。`goto` 可跳 `#hash` / URL / 场景名 |

## 变量与条件

- 写入：`choice.set`、`hook.set`、`vn.setVar`。
- 读取：`showWhen` / `jump.if` / `choice.showWhen`。
- 条件语法（`src/vn/vars.ts`，安全解析不 eval）：
  ```
  $name                    # 真值
  $flag == 'a'  $flag != 'a'  $cnt === 1
  $a == 'x' && $b == 2   $a == 'x' || $b == 2
  ```
- 全局变量以 `$` 引用（`$seen_<key>` 解锁回想），跨场景持久化。

## meta.ui（样式声明）

```ts
meta: {
  ui: {
    dialog: { left, right, top, bottom, align, bg, color, textSize, radius, minHeight, padding, bgImg, animate },
    choice: { align, itemBg, itemColor, fontSize, gap, animate },
    cgBox:  { aspect, maxWidth },
    title:  '标题文本',
  },
}
```
- `dialog.bgImg`：对话框背景贴图 URL（铺在 `bg` 之上 cover）。
- `animate: true`：换台词淡入上浮。

## 翻译维护

场景由 `scripts/rmmz2vn.py` 从 RMMZ 游戏 CommonEvents 生成。**重跑会覆盖现有中文翻译**，非必要不执行。翻译原则（详见 `src/vn/README.md` 维护提示）：整句意译、拟声词依语境多变、成人向译文生动不套模板。
