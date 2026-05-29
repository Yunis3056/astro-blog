# 运维

## 常见问题

### `/admin` 无法登录

检查 Sanity 项目的 CORS 设置，确保本地域名和生产域名已开启 authenticated requests。

### 预览无草稿内容

检查：

- `SANITY_API_READ_TOKEN` 是否配置。
- `SANITY_PREVIEW_SECRET` 是否与预览入口一致。
- `/api/draft-mode/enable` 是否返回 302。
- Preview route 是否使用 `/preview/[kind]/[slug]/`。

### 发布后前台没更新

检查 Sanity webhook 是否命中 Vercel Deploy Hook。公开页是预渲染产物，不是全站实时 SSR。

### 搜索索引缺失

`postbuild` 会运行 `scripts/run-pagefind.mjs`，自动寻找 `dist`、`dist/client` 或 `.vercel/output/static`。如果没有找到 `index.html`，先确认 `npm run build` 是否成功。

### CMS 校验失败

按照 `verify:cms` 输出修复 Sanity 文档。常见原因是缺 slug、引用删除后的专题/系列、系列顺序重复。
