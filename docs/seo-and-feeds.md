# SEO 与 RSS

## 页面

- `BaseHead` 输出 canonical、Open Graph、Twitter Card、RSS 和 Sitemap 元信息。
- 公开内容 URL 保持不变：`/blog/[slug]/`、`/notes/[slug]/`、`/projects/[slug]/`、`/topics/[slug]/`、`/series/[slug]/`。
- 草稿只出现在 `/preview/**`，并用 `data-pagefind-ignore` 避免进入搜索索引。

## RSS

`/rss.xml` 从 Sanity 公开文章生成，正文由 Portable Text 渲染为清洗后的 HTML。封面图使用 Sanity 图片 URL，不再输出本地文件路径。

## Sitemap

Sitemap 由 Astro 集成生成。公开页预渲染后进入 Sitemap，草稿不进入。

## Pagefind

构建完成后运行 Pagefind。内容详情页通过 `SearchMeta` 输出：

- `type`
- `topic`
- `tag`
- `series`
- `date`

搜索弹窗按需加载 `/pagefind/pagefind.js`。
