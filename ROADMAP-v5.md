# 博客 5.0 路线图：线上写作平台 + 可视化发布工作台

## 目标

把博客从“Git + 本地 Markdown 文件发布”升级为“Sanity 在线写作 + Astro/Vercel 混合渲染”的内容平台。5.0 的核心不是多一个页面，而是把创建、预览、发布、搜索、SEO 和验证串成完整工作台。

## 已落地

- Sanity Studio 挂载到 `/admin`。
- Sanity schema 覆盖文章、笔记、项目、专题、系列、站点设置。
- 正文统一为 Portable Text，支持标题、列表、引用、链接、代码块、图片和表格。
- Astro 改为 Vercel server 输出，公开页面设置为预渲染，预览/API 保持 SSR。
- 前台数据层改为 Sanity GROQ 查询，不再读取 `astro:content`。
- 新增 `/preview/[kind]/[slug]/` 草稿预览路由、Draft Mode API 和 Visual Editing 组件。
- 新增 `migrate:cms`、`verify:cms`、server 输出下的 Pagefind/链接验证适配。
- 废弃 `npm run new` 本地建文流程。

## 后续验收

- 在真实 Sanity 项目中导入迁移数据。
- 配置 Vercel Deploy Hook，让 Sanity 发布后触发重建。
- 在 Sanity 项目设置中添加本地和生产域名 CORS。
- 配置 `SANITY_API_READ_TOKEN` 后验收 Presentation Tool 和 Visual Editing。
- 清理或归档旧 `src/content/**`，只保留迁移记录。
