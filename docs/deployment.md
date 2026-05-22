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
npm.cmd run build
```

`npm.cmd run build` 会执行：

1. Astro 静态构建。
2. `postbuild` 中的 Pagefind 索引生成。

最终产物位于 `dist/`。

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

## 部署验收

- 首页、文章列表、文章详情可访问。
- `/rss.xml` 可访问。
- `/sitemap-index.xml` 或 sitemap 输出可访问。
- `/pagefind/pagefind.js` 可访问。
- 至少一张 `/og/*.png` 可访问。
- 明暗主题切换、搜索弹窗、ClientRouter 切页后交互正常。
