# 内容模型

本文档定义当前内容字段。代码实现以 `src/content.config.ts` 为准，文档变更后需要同步 schema。

## 当前 blog 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `title` | `string` | 是 | 文章标题 |
| `description` | `string` | 是 | 摘要，用于列表、SEO、RSS |
| `pubDate` | `date` | 是 | 发布时间 |
| `updatedDate` | `date` | 否 | 更新时间 |
| `heroImage` | `image` | 否 | 文章封面图 |
| `tags` | `string[]` | 否 | 标签，默认为空数组 |
| `topics` | `string[]` | 否 | 引用 `src/content/topics/` 的专题 slug |
| `series` | `{ slug, order }` | 否 | 引用 `src/content/series/` 的阅读系列 |
| `featured` | `boolean` | 否 | 是否进入精选入口，默认为 `false` |
| `canonicalURL` | `url` | 否 | 外部首发或转载 canonical |
| `draft` | `boolean` | 否 | 草稿，默认为 `false` |

示例：

```md
---
title: "一次 Astro 博客升级记录"
description: "记录从功能增强到发布流程固化的过程。"
pubDate: 2026-05-22
updatedDate: 2026-05-22
tags: ["Astro", "博客", "工程化"]
topics: ["site-engineering"]
series: { slug: "astro-blog-upgrade", order: 1 }
featured: false
draft: true
---
```

## 草稿规则

`draft: true` 的文章不应出现在：

- 文章列表。
- 标签页。
- 归档页。
- RSS。
- Sitemap。
- OG 图片生成。
- Pagefind 搜索索引。

如果某个新页面消费文章列表，必须复用同样的公开内容过滤逻辑。

## 标签规则

- 标签使用中文或常见技术名词，不加 `#`。
- 页面展示不显示文章数量，保持轻量。
- 同义标签只保留一个写法，例如不要同时使用 `Astro` 和 `astro`。
- 新标签如果只会使用一次，可以先考虑是否适合放进正文关键词，而不是 frontmatter。

## 专题规则

- 专题是主导航结构，用少量稳定主题连接文章、笔记和项目。
- `topics` 中的 slug 必须存在于 `src/content/topics/`。
- 专题页会聚合文章、笔记和项目。

## 系列规则

- 系列用于连续阅读路径，适合跨文章和笔记组织内容。
- `series.slug` 必须存在于 `src/content/series/`。
- 同一系列中的公开内容 `series.order` 必须唯一。

## 4.0 内容集合

| 集合 | 作用 |
|---|---|
| `blog` | 长文章和 MDX 文章 |
| `notes` | 短笔记 |
| `projects` | 项目详情 |
| `topics` | 高层知识专题 |
| `series` | 连续阅读路径 |

## 设计原则

- 新字段必须有明确消费方：页面、RSS、OG、搜索、SEO 或脚本。
- 默认值要保守，避免新文章必须填大量无用字段。
- 字段语义要稳定，避免把展示样式写进内容模型。
- schema、模板、文档必须一起更新。
