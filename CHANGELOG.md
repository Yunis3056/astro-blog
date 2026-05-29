# Changelog

## 5.0.0

- 升级为 Sanity 在线写作平台，新增 `/admin` Studio、草稿预览和 Visual Editing。
- 前台内容读取从 `astro:content` 切换到 Sanity GROQ 数据层。
- 正文统一为 Portable Text，旧 Markdown/MDX 通过 `npm run migrate:cms` 一次性迁移。
- Astro 改为 Vercel server 输出，公开页面预渲染，预览/API 按需渲染。
- 新增 `verify:cms`，并调整 Pagefind、dist、链接验证以适配混合渲染输出。
- 废弃 `npm run new` 本地文件写作流程。

## 4.0.0

- 新增专题和系列内容组织。
- 首页升级为知识入口。
- Pagefind 搜索增加类型、专题、标签过滤和日期排序。
- 文章页增加系列进度、专题入口、相关文章和评论区域。
