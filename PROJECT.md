# PROJECT.md — 项目架构与开发指南

## 项目定位

**subcanvas** — 基于 PixiJS v8 + React 的组件框架，提供窗口系统、对话框、图片/视频播放器、滚动容器等 UI 组件，以及 2048/Conway/AVD 等示例。

---

## 目录结构（`sim` 分支）

```
Hana-ame/
├── public/
│   ├── favicon.ico
│   ├── manifest.webmanifest     # PWA 配置
│   └── sw.js                    # Service Worker（sim-vN 版本控制）
├── src/
│   ├── main.tsx                 # 入口
│   ├── framework/               # 核心框架
│   │   ├── PixiApp.ts           # 管理 PIXI.Application 生命周期
│   │   ├── SubCanvas.ts         # 子画布（PIXI.Container 包装）
│   │   ├── SubCanvasProxy.ts    # 子画布代理
│   │   ├── EventBus.ts          # 发布订阅事件总线
│   │   └── index.ts             # 公开 API 导出
│   ├── components/              # UI 组件
│   │   ├── PixiWindow.ts        # 可拖拽窗口
│   │   ├── PixiConfirm.ts       # 确认对话框
│   │   ├── PixiImage.ts         # 图片显示
│   │   ├── PixiVideoPlayer.ts   # 视频播放器
│   │   ├── ClickableImage.ts    # 可点击图片（全屏展开）
│   │   ├── FullscreenManager.ts # 全屏管理（单例）
│   │   ├── Scrollable.ts        # 可滚动容器
│   │   ├── Loading.ts           # 加载动画
│   │   ├── Avd.ts               # AVD（视觉小说）引擎
│   │   └── VideoPlayer.tsx      # DOM 视频播放器
│   ├── example/                 # 示例页面
│   │   ├── component-2048/      # 2048 游戏
│   │   ├── component-conway/    # 康威生命游戏
│   │   ├── component-avd/       # 视觉小说演示
│   │   ├── component-cutscene/  # 过场动画
│   │   ├── component-life-map/  # 生命地图
│   │   ├── component-window/    # 窗口演示
│   │   └── ...
│   └── index.css
├── PROJECT.md                   # 本文档
├── README.md
└── package.json                 # name: "subcanvas"
```

---

## 架构数据流

```
React (mount)
  └─ useEffect([])              # 只挂载一次
       └─ startPixiApp()
            ├─ 创建 PIXI.Application
            ├─ 创建 SubCanvasProxy
            └─ onReady(proxy)
                 ├─ 创建 SubCanvas region
                 ├─ 注册 onPress/onMove/onRelease
                 ├─ 初始化游戏状态（模块级 let state）
                 └─ 构建 PIXI 场景
```

**关键原则**：
- React 只负责 mount/unmount，**不管理游戏状态**
- 所有状态（score/rows/board 等）放在**模块级 `let` 变量**中
- 状态变更直接 mutate + 调 `buildBoard()` 原地重画，**绕过 React re-render**
- 整屏只允许 canvas，UI 全部用 PIXI 实现

---

## 核心概念

| 概念 | 说明 |
|------|------|
| **PixiApp** | 单例 PIXI.Application 管理，保证全屏只有一个 canvas |
| **SubCanvas** | PIXI.Container 的子区域，支持 clip、drag、子 region |
| **SubCanvasProxy** | SubCanvas 的代理，提供 `createRegion()` 等 API |
| **EventBus** | `proxy.bus.on/emit/off` 跨组件通信 |
| **Drag 模式** | `'title'`（仅标题栏拖拽）/ `'anywhere'`（任意处）/ `'none'` |

---

## 开发指南

### 添加新示例

1. 创建 `src/example/component-xxx/ComponentXxxDisplay.tsx`
2. 遵循单 useEffect 模式：
```ts
let state: GameState | null = null;

export function ComponentXxxDisplay() {
  useEffect(() => {
    const destroy = startPixiApp((proxy) => {
      const region = proxy.createRegion({...});
      state = { region, ... };
      // 注册事件 → 构建场景
    });
    return () => { destroy(); state = null; };
  }, []);
  return <></>;
}
```
3. 在 `src/example/examples.ts` 中注册

### 添加新组件

1. 创建 `src/components/Xxx.ts`
2. 使用 `PIXI.Container` + `PIXI.Graphics` / `PIXI.Text` 实现
3. 接受 SubCanvas 作为容器，通过 `addChild` 挂载
4. 提供 destroy 清理方法

---

## PWA / 部署

- **Cloudflare Pages**（`pixijs-sim-react` 项目）
- 来源: `Hana-ame/Hana-ame` 仓库 `sim` 分支
- 域名: `https://react.moonchan.xyz`
- Service Worker: `public/sw.js`（`sim-vN` 版本号，每次重大 deploy 需 bump）
- GitHub Actions: lint + typecheck + build

---

## 踩坑精选

| 问题 | 根因 | 解法 |
|------|------|------|
| 2048 点一下黑屏闪 | useEffect dep 有 state → destroy+recreate canvas | 模块级 let state，单 useEffect |
| 视频黑屏 | primer 前 sprite 被 render → lazy GPU alloc 竞态 | `player.root.visible = false` 直到点击 |
| destroy 后 `_callContextMethod` crash | Graphics context=null 后仍调 `.clear()` | `destroyed` flag 守卫 / try-catch |
| SW stale 导致 JS 不加载 | 旧 SW serve 旧 HTML → 引用已删 bundle | bump `sim-vN` |
