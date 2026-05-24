# SEO 与 Feed

本文档记录站点 SEO、RSS、Sitemap、OG 和搜索索引的约定。

## 页面元信息

`BaseHead.astro` 负责输出基础 head 信息。页面应提供：

- `title`
- `description`
- canonical URL
- Open Graph 信息
- 主题初始化脚本

文章页的 `title` 和 `description` 来自 frontmatter。

## RSS

RSS 由 `src/pages/rss.xml.js` 生成。

规则：

- 只包含 `draft: false` 的文章。
- 优先输出完整正文 HTML。
- 使用站点绝对 URL。
- 发布时间来自 `pubDate`。
- 更新时间来自 `updatedDate`，没有则不输出或使用发布时间。

## Sitemap

Sitemap 由 `@astrojs/sitemap` 生成，依赖 `astro.config.mjs` 中的 `site`。

规则：

- 生产域名变化时必须更新 `site`。
- 草稿页面不应被生成，因此也不应进入 sitemap。

## OG 图片

OG 图片由 `src/pages/og/[...slug].png.ts` 生成。

规则：

- 只为公开文章生成。
- 使用本地字体资源，不依赖构建时联网。
- 中文必须可读，不能出现方框。
- 标题过长时要有合理换行或截断策略。

## 搜索索引

搜索使用 Pagefind，在 `postbuild` 阶段扫描 `dist/`。

规则：

- 构建命令必须触发 `postbuild`。
- 页面正文使用 `data-pagefind-body` 标记。
- 标题使用 `data-pagefind-meta="title"`。
- 内容详情页输出 `type`、`topic`、`tag`、`series` 元数据。
- 内容详情页输出 `date` 排序字段，搜索弹窗可按日期排序。
- 草稿不生成公开 HTML，因此不会进入索引。

## 4.0 外部增长入口

- Giscus 通过 GitHub Discussions 承载评论，未配置时显示 Discussions 链接。
- Plausible 只在 `PUBLIC_PLAUSIBLE_DOMAIN` 存在时输出脚本。
- 外部首发内容可以使用 `canonicalURL` 覆盖 canonical。
