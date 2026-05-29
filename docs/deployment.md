# 部署

## 平台

5.0 锁定 Vercel。Astro 使用 `@astrojs/vercel` server adapter：

- 公开页面设置 `prerender = true`，构建成静态 HTML。
- `/admin`、`/preview/**`、`/api/draft-mode/**` 走 SSR。
- Pagefind 在构建后扫描实际静态输出目录。

## 必要环境变量

```env
PUBLIC_SITE_URL=https://example.com
PUBLIC_SANITY_PROJECT_ID=xxxx
PUBLIC_SANITY_DATASET=production-blog
SANITY_STUDIO_PROJECT_ID=xxxx
SANITY_STUDIO_DATASET=production-blog
SANITY_STUDIO_PREVIEW_URL=https://example.com
SANITY_API_VERSION=2025-02-19
SANITY_API_READ_TOKEN=...
SANITY_PREVIEW_SECRET=...
```

## Sanity 设置

- 在 Sanity 管理后台添加本地和生产域名 CORS。
- 创建 Viewer 权限 token，配置到 `SANITY_API_READ_TOKEN`。
- 给 Sanity webhook 配置 Vercel Deploy Hook，用于发布后重建。
- Studio 访问 `/admin`，由 Sanity 登录和项目权限控制。

## 本地验证

```sh
npm.cmd run check
npm.cmd run verify:cms
npm.cmd run build
npm.cmd run verify:dist
npm.cmd run verify:links
```

如果没有配置 Sanity 环境变量，`verify:cms` 和 `build` 会失败，这是预期行为。
