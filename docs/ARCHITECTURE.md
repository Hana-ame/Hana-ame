# 引擎架构

## 概述

`src/vn/` 是纯 DOM/React 的剧本驱动 VN 引擎（无 canvas/游戏框架依赖）。剧本 = `VnScript`（`meta` + `lines`），播放器按行推进，指令集驱动画面/音/存档/界面。

```
路由 (#hash)  → src/example/examples.ts (React.lazy) → hscene/<key>.tsx → <VnPlayer script> 
```

## 模块职责

| 文件 | 职责 |
|------|------|
| `VnPlayer.tsx` | 播放器主实现：指令分派、图层渲染、打字机、选项/菜单/按钮层、回放/自动/跳过/设置、存档挂载 |
| `types.ts` | 全部指令/类型定义（`VnScript`、`VnLine` 联合、`VnHandle`、`VnUiStyle`…） |
| `loader.ts` | 资源加载器：`preload` 声明 key→url，`waitFor`/`waitAll`，onload 追踪 |
| `audio.ts` | `VnAudioEngine`：bgm/sfx/voice 三频道 HTMLAudio 管理 |
| `vars.ts` | `evalCond`：安全条件表达式解析（不 eval），本地 vars + 全局 ⊕ |
| `global-state.ts` | 跨场景状态：localStorage + `useSyncExternalStore` 订阅；`markSceneSeen`/`isSceneSeen` |
| `save.ts` | IndexedDB 分键存档：save/load/list/delete/reset |
| `settings.ts` | 音量/打字机速度/自动延迟，localStorage 持久化 |
| `prefetch.ts` | 跳转场景前预取：拉取目标 chunk + 不可见 `<img>` 预热 |
| `effects.ts` | `stand`/`transition` 的 keyframe 映射（CSS 动画） |
| `styles.ts` | 引擎注入的全局 keyframes/styles |
| `scenes/{azusa,iru,isekai}/` | 77 个场景剧本（`scripts/rmmz2vn.py` 生成，可手改） |

## 播放流程

1. `runLine(idx)` 逐行 `switch(line.type)`：
   - 视觉指令（`bg`/`cg`/`say`/`stand`）→ 更新图层状态并推进；
   - 资源指令（`preload`）→ 等加载（`wait`）或后台加载；
   - 交互指令（`choice`/`menu`/`wait`）→ 挂起等用户；
   - 流程指令（`jump`/`label`/`end`）→ 跳转/结束。
2. `advance()`：点击/Enter 推进；typing 未打完先补全。
3. `say` 台词并入 backlog；`end` 自动 `markSceneSeen(scriptKey)` 并 `goto`。

## 图层

- 两层语义：`bg`（cover 占满）、`cg`（contain 看全）；同 `index` 时 cg 在 bg 前。
- `index`/`zIndex` 可选控制叠加；`fadeMs` 淡入；换图等 `onload` 再推进（避免黑屏）。
- 立绘层：`stand` 三位置（left/center/right），点击可隐藏。

## 变量与条件

- 本地 vars：`choice.set` / `hook.set` / `vn.setVar` 写入。
- 求值视图 = 全局 ⊕ 本地（本地覆盖同名全局；全局以 `$name` 引用）。
- 解锁：场景 `end` → `markSceneSeen` 写 `seen_<key>`；回想条目 `showWhen: "$seen_<key>"`。

## 存档

- IndexedDB 分键（每槽位一键），快照 = 行号/变量/图层/立绘/台词/bgm，不依赖剧本函数。
- 跨场景读档：`loadGame` 检测 `scriptKey` 不一致 → 应用层导航到对应场景。

## 界面即剧本

标题/回想/菜单 = 普通 scenario（`menu` 指令：`title`/`list`/`grid`），不硬编码 React 界面：
- `#vn-title`（`src/example/title/`）→ `menu layout:'title'`
- `#vn-menu`（`src/example/vn-menu/`）→ `menu layout:'grid'`（分组/封面来自 `scene-covers.ts`）
- `#vn-recall`（`src/example/recall/`）→ `menu layout:'list'` + `showWhen` 解锁

## 分包约束

`src/example/examples.ts` 是唯一注册表，所有场景 `React.lazy` 按 `#hash` 加载——剧本/图片映射**绝不可静态 import 进主包**（曾致 1.9MB 主包 504）。

完整指令集与 `VnHandle` 参考：`src/vn/README.md`。
