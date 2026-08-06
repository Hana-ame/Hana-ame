# Hana VN 文档

纯浏览器视觉小说（VN）项目文档。开发/生产分支：`proj/vn`。

## 入口

| 文档 | 内容 |
|------|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | 引擎架构：`src/vn/` 模块职责、播放流程、图层/存档/全局状态 |
| [SCENARIO.md](SCENARIO.md) | 剧本编写指南：新增一个场景的完整步骤、指令集速查、变量与条件 |
| [ASSETS.md](ASSETS.md) | 资源与工具链：图片外链、`scripts/` 生成/校验工具、上传流程 |

- 指令集 / `VnHandle` / 存档 / 全局状态的完整参考见 `src/vn/README.md`（引擎级文档，随代码走）。
- 历史设计文档归档在 `docs/archive/`（goals / WebGAL 调查 / 迁移方案，仅作背景）。

## 快速导航

- 默认入口 `#vn-title` → 标题 → `#vn-menu`（回想）→ `#hscene-<key>`（场景）
- 场景脚本：`src/vn/scenes/{azusa,iru,isekai}/`（77 个）
- 场景注册表：`src/example/examples.ts`（唯一，全 `React.lazy` 分包）
- 播放器：`src/vn/VnPlayer.tsx`
