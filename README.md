# Hana VN

纯浏览器视觉小说（VN）引擎与剧本库。剧本驱动，`#hash` 路由按需加载场景。

## 起步

```sh
npm install
npm run dev        # http://localhost:5173（dev server 监听 0.0.0.0）
npm run build      # 产物 dist/
npm run lint       # eslint（0 error 标准）
npm run test       # vitest
```

## 入口与路由

- 默认入口 `#vn-title`：数据驱动标题界面
- `#port`：HS 回想菜单（`menu layout:'grid'`）
- `#hscene-<key>`：H 场景（77 个，位于 `src/vn/scenes/{azusa,iru,isekai}`）
- `#vn-recall`：回想解锁页面
- `#component-vn`：通用 VN 宿主组件

## 架构

- `src/vn/` — VN 引擎（剧本驱动，`VnScript` = meta + lines）
  - `VnPlayer.tsx` 播放器、`types.ts` 指令/类型、`loader.ts` 资源、`audio.ts` 音频、`save.ts` 存档（IndexedDB）、`global-state.ts` 跨场景状态（localStorage）、`effects.ts` 演出 keyframe
  - 指令集与 `VnHandle` 用法见 `src/vn/README.md`
- `src/example/examples.ts` — 唯一场景注册表，全部 `React.lazy` 分包，`#hash` 按需加载（严禁静态 import 拖进主包）
  - `hscene/*.tsx` 场景包装器、`title/` 标题、`recall/` 回想、`vn-menu/` 菜单、`component-vn/` 宿主
- `scripts/` — 场景/资源工具链（`rmmz2vn`、`generate_scripts`、`verify_scenes`、`decrypt_cgs`、`fetch_gallery`）

文档见 [`docs/README.md`](docs/README.md)（架构 / 剧本编写 / 资源工具链）。

## 资源约定

- H 场景图片一律用 `ex.moonchan.xyz` 外链（`ex.moonchan.xyz/s/<hash>/<id>?redirect_to=image`）
- 资源按剧本 `preload` 声明加载；`wait:true` 等加载完再继续
- 场景 `end.goto:'#port'` 自动回菜单；跨场景状态用 `global-state.ts`

## 分支

- 开发/生产分支：`proj/vn`
