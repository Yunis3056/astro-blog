# 写作流程

## 创建内容

打开 `/admin`，在 Sanity Studio 中创建文章、笔记、项目、专题或系列。不要再复制 Markdown 文件到 `src/content/**`，`npm run new` 已废弃。

## 编辑与预览

1. 填写标题、摘要、slug、专题、标签和正文。
2. 正文使用 Portable Text 编辑器。
3. 上传图片到 Sanity 媒体库，并填写 alt。
4. 点击 Presentation Tool，在 `/preview/[kind]/[slug]/` 查看草稿。
5. 需要可视化定位字段时，开启 `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true` 并配置 `SANITY_API_READ_TOKEN`。

## 发布

1. 确认 slug 不变，避免破坏旧 URL。
2. 确认专题和系列引用正确。
3. 同一系列内顺序不重复。
4. 发布文档。
5. Sanity webhook 触发 Vercel 重建后，公开页面、RSS、Sitemap 和搜索索引同步更新。

## 迁移旧内容

```sh
npm.cmd run migrate:cms
```

生成的 NDJSON 位于 `tmp/sanity-migration/content.ndjson`。如果报告里出现 MDX import、MDX 组件、原始 HTML 或本地图片，需要先改写内容，再重新生成并导入 Sanity。
