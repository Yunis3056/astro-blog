# ADR 0001: 内容模型以 Astro Content Collections 为核心

## Status

Proposed

## Context

站点已经使用 `src/content/blog/` 存放 Markdown / MDX 文章，并通过 `src/content.config.ts` 定义 schema。v3.0 计划扩展系列、精选、canonical、封面 alt 等字段，需要避免字段散落在页面实现里。

## Decision

继续以 Astro Content Collections 作为内容模型中心。

- 所有文章字段先进入 `src/content.config.ts`。
- 文档同步记录在 `docs/content-model.md`。
- 新文章模板必须输出符合 schema 的 frontmatter。
- 页面只消费 schema 中定义过的字段。

## Consequences

优点：

- 字段有类型和默认值。
- 构建期能发现缺字段或类型错误。
- 页面、RSS、OG、搜索可以共享同一套内容约定。

代价：

- 每次字段调整都要同步 schema、模板和文档。
- 对临时字段不友好，但这能避免内容模型失控。
