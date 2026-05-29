# ADR 0004: 使用 Sanity 做线上写作和内容源

## 背景

4.0 的内容仍然依赖 `src/content/**` 文件。发布文章需要复制文件、修改 frontmatter、提交代码，不适合作为长期写作工作台。

## 决策

5.0 使用 Sanity 作为唯一内容源，Astro 通过 GROQ 查询读取内容。Sanity Studio 挂载在 `/admin`，负责在线写作、草稿、媒体、发布和可视化预览。

公开页面保持预渲染，通过 Sanity webhook 触发 Vercel 重建。预览页和 Draft Mode API 使用 SSR。

## 影响

- 旧 Markdown/MDX 只作为迁移输入。
- 正文统一迁移为 Portable Text。
- `verify:content` 改为校验 Sanity 数据。
- 没有 Sanity 环境变量时不能完整构建生产站点。
