# 资源与工具链

## 图片外链约定

- H 场景图片一律用 **`ex.moonchan.xyz` 外链**：`ex.moonchan.xyz/s/<hash>/<id>?redirect_to=image`
- 不要用本地 `/game-cgs/`（已否决）。外链在 DOM `<img>` 无 CORS 限制。
- 图片地址直接内联在场景剧本的 `preload.assets[].url` 里。

## 工具链（`scripts/`）

| 脚本 | 作用 | 注意 |
|------|------|------|
| `rmmz2vn.py` | 把 3 个 RMMZ 游戏的 H-scene CommonEvents 转为 `src/vn/scenes/<prefix>_<evid>.ts` | **重跑会覆盖中文翻译**，非必要不执行 |
| `generate_scripts.py` | 从 CommonEvents.json 重生成 scripts（旧工具，rmmz2vn 的替代/前身） | |
| `verify_scenes.py` | 校验场景/事件映射完整性 | |
| `decrypt_cgs.py` | 解密本地游戏 CG 到 `public/game-cgs`（本地图源，仅参考） | |
| `fetch_gallery.py` | 抓取 ex.moonchan.xyz gallery 图片清单：`fetch_gallery.py <gid> <token> <out.json> [pages]` | |

## 上传流程（根目录）

| 文件 | 作用 |
|------|------|
| `upload_images.py` | 批量上传 H 场景图片（E-Hentai → p.sda1.dev 风格），读 `moonchan_cookies.txt` |
| `upload_images2.py` | 上传变体 |
| `fix_images.py` | 以裸二进制重传（修复 multipart 包装），读 `image_urls.json` |
| `image_urls.json` | 图片 URL 清单（上传产物） |
| `upload_batch/` | 上传结果记录 |

## 场景结构

- 77 个场景剧本：`src/vn/scenes/{azusa,iru,isekai}/`（前缀即角色/游戏）
- 每个场景 = 一个懒加载 `hscene/<name>.tsx` 包装 + `examples.ts` 注册表条目（见 `docs/SCENARIO.md`）

## 运行

```sh
npm run dev     # 本地 dev（监听 0.0.0.0）
npm run build   # dist/
npm run lint / npm run test
```

> 验收以已部署站为准：push → 等部署 → curl 线上地址（项目文档约定见 `AGENTS.md`）。
