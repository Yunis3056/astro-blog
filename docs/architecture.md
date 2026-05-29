# 架构

## 当前形态

5.0 是 Astro + Sanity + Vercel 的混合渲染博客：

- Sanity Content Lake：唯一内容源。
- Sanity Studio：挂载在 `/admin`，负责在线写作、草稿、发布和可视化预览。
- Astro：负责前台页面、RSS、Sitemap、OG、Pagefind 索引和预览页面。
- Vercel：运行 Astro server 输出，并承载预渲染的公开页面。

## 内容流

1. 作者在 `/admin` 创建或编辑内容。
2. Sanity 保存草稿，Presentation Tool 打开 `/preview/[kind]/[slug]/` 查看草稿。
3. 发布后，Sanity webhook 触发 Vercel Deploy Hook。
4. Vercel 重新构建公开页、RSS、Sitemap、OG 和 Pagefind。
5. 访问者读取预渲染公开页面；后台和预览走 SSR。

## 代码结构

```text
sanity.config.ts          Sanity Studio 配置
sanity/schemaTypes/       Sanity 内容模型
sanity/structure.ts       Studio 左侧结构
src/lib/content.ts        前台 Sanity 数据层
src/lib/sanity/           查询、图片、Portable Text 工具
src/pages/preview/        草稿预览页面
src/pages/api/draft-mode/ Draft Mode API
scripts/migrate-cms.mjs   旧内容迁移脚本
scripts/verify-cms.mjs    CMS 内容质量检查
```

`src/content/**` 只作为迁移输入保留，不再被前台运行时读取。
