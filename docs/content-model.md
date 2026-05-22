# 内容模型

本文档定义当前内容字段和 v3.0 计划扩展。代码实现以 `src/content.config.ts` 为准，文档变更后需要同步 schema。

## 当前 blog 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `title` | `string` | 是 | 文章标题 |
| `description` | `string` | 是 | 摘要，用于列表、SEO、RSS |
| `pubDate` | `date` | 是 | 发布时间 |
| `updatedDate` | `date` | 否 | 更新时间 |
| `heroImage` | `image` | 否 | 文章封面图 |
| `tags` | `string[]` | 否 | 标签，默认为空数组 |
| `draft` | `boolean` | 否 | 草稿，默认为 `false` |

示例：

```md
---
title: "一次 Astro 博客升级记录"
description: "记录从功能增强到发布流程固化的过程。"
pubDate: 2026-05-22
updatedDate: 2026-05-22
tags: ["Astro", "博客", "工程化"]
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

## v3.0 候选字段

这些字段还没有全部实现，实施前需要同步 schema、模板和页面消费方。

| 字段 | 类型 | 目的 | 优先级 |
|---|---|---|---|
| `featured` | `boolean` | 首页或专题页精选 | P0 |
| `series` | `string` 或对象 | 系列文章导航 | P0 |
| `coverAlt` | `string` | 封面图可访问性文本 | P0 |
| `canonicalURL` | `string` | 外部首发或转载 canonical | P1 |
| `lang` | `zh-CN` / `en` | 未来双语预留 | P2 |
| `status` | `draft` / `published` / `archived` | 替代单一 draft 的更细状态 | P2 |

## 设计原则

- 新字段必须有明确消费方：页面、RSS、OG、搜索、SEO 或脚本。
- 默认值要保守，避免新文章必须填大量无用字段。
- 字段语义要稳定，避免把展示样式写进内容模型。
- schema、模板、文档必须一起更新。
