# 部署说明

本文档描述本项目的构建和部署要求。

## 环境要求

- Node.js `>=22.12.0`
- npm

Windows PowerShell 下建议使用 `npm.cmd`，避免执行策略影响 `npm.ps1`。

## 本地构建

```sh
npm install
npm.cmd run check
npm.cmd run verify:content
npm.cmd run build
npm.cmd run verify:dist
npm.cmd run verify:links
```

`npm.cmd run build` 会执行：

1. Astro 静态构建。
2. `postbuild` 中的 Pagefind 索引生成。

最终产物位于 `dist/`。

`verify:dist` 和 `verify:links` 必须在构建后运行，因为它们检查的是 `dist/` 中的实际产物。

## CI 验证

仓库包含 GitHub Actions 验证工作流：

- 触发范围：`dev` 和 `main` 的 push / pull request。
- Node.js：`22.12.0`。
- 执行步骤：`npm ci`、`npm run check`、`npm run verify:content`、`npm run build`、`npm run verify:dist`、`npm run verify:links`。
- 链接策略：只阻塞内部链接、图片路径和锚点错误；外部链接第一版不阻塞发布。
- 自动化范围：只做验证，不负责自动部署。

## 本地预览

```sh
npm.cmd run preview
```

如果 `localhost:4321` 返回旧内容或 404，先检查是否存在旧 dev server 占用端口。Windows 上可用：

```powershell
Get-NetTCPConnection -LocalPort 4321
```

确认进程后再停止对应 PID。

## 生产部署

项目是纯静态站点，可以部署到：

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages
- 任意静态文件服务器

部署平台必须执行完整构建命令：

```sh
npm run build
```

不要只运行 `astro build`，否则会跳过 Pagefind `postbuild` 索引。

## 站点 URL

`astro.config.mjs` 中的 `site` 会影响：

- Sitemap URL。
- RSS 中的绝对链接。
- OG 图片链接。
- 社交平台分享预览。

生产域名变化时必须同步更新 `site`。

## 可选外部服务

这些变量不配置时站点仍可构建，并使用静态降级入口：

- `PUBLIC_PLAUSIBLE_DOMAIN`：启用 Plausible 统计脚本和点击事件。
- `PUBLIC_GISCUS_REPO`、`PUBLIC_GISCUS_REPO_ID`、`PUBLIC_GISCUS_CATEGORY`、`PUBLIC_GISCUS_CATEGORY_ID`：启用 Giscus 评论。

## 部署验收

- 首页、文章列表、文章详情可访问。
- `/rss.xml` 可访问。
- `/sitemap-index.xml` 或 sitemap 输出可访问。
- `/pagefind/pagefind.js` 可访问。
- 至少一张 `/og/*.png` 可访问。
- `/topics/`、`/series/` 可访问。
- 明暗主题切换、搜索筛选、评论降级入口、ClientRouter 切页后交互正常。
