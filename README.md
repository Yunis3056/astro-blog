# Yunis 的博客

Astro + Sanity 的中文知识博客。5.0 之后，Sanity 是唯一内容源；旧的 `src/content/**` 只作为一次性迁移输入保留，不再参与前台运行时渲染。

## 功能

- Sanity Studio 挂载在 `/admin`，支持文章、笔记、项目、专题、系列和站点设置在线编辑。
- Astro 部署到 Vercel server 输出，公开页预渲染，预览和后台按需渲染。
- Portable Text 正文、Sanity 图片管线、草稿预览、Presentation Tool 和 Visual Editing。
- Pagefind 站内搜索，支持类型、专题、标签筛选和日期排序。
- RSS、Sitemap、动态 OG 图、Giscus 评论和 Plausible 统计。

## 命令

```sh
npm install
npm.cmd run dev
npm.cmd run check
npm.cmd run verify:cms
npm.cmd run build
npm.cmd run verify:dist
npm.cmd run verify:links
```

迁移旧内容：

```sh
npm.cmd run migrate:cms
```

迁移脚本会生成 `tmp/sanity-migration/content.ndjson` 和报告。遇到 MDX import、MDX 组件、原始 HTML 或无法上传的本地图片会失败，需要先人工改写成 Portable Text 可表达的内容。

## 环境变量

先复制 `.env.example` 为 `.env`，再填入真实 Sanity 项目。没有配置 Sanity 时，本地 `dev` 会显示配置提示；`build`、`verify:cms` 会失败，避免发布空站。

```env
PUBLIC_SITE_URL=https://example.com
PUBLIC_SANITY_PROJECT_ID=xxxx
PUBLIC_SANITY_DATASET=production-blog
SANITY_STUDIO_PROJECT_ID=xxxx
SANITY_STUDIO_DATASET=production-blog
SANITY_STUDIO_PREVIEW_URL=http://localhost:4321
SANITY_API_VERSION=2025-02-19
SANITY_API_READ_TOKEN=...
SANITY_PREVIEW_SECRET=...
PUBLIC_SANITY_VISUAL_EDITING_ENABLED=false
```

可选：

```env
PUBLIC_PLAUSIBLE_DOMAIN=example.com
PUBLIC_GISCUS_REPO=owner/repo
PUBLIC_GISCUS_REPO_ID=...
PUBLIC_GISCUS_CATEGORY=...
PUBLIC_GISCUS_CATEGORY_ID=...
```

## 文档

- [v5.0 路线图](./ROADMAP-v5.md)
- [架构](./docs/architecture.md)
- [内容模型](./docs/content-model.md)
- [写作流程](./docs/writing-workflow.md)
- [部署](./docs/deployment.md)
- [质量门禁](./docs/quality-gates.md)
