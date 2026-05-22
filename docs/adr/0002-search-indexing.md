# ADR 0002: 搜索索引使用 Pagefind

## Status

Accepted

## Context

博客是纯静态站点，需要中文内容可搜索，同时不引入服务端搜索。v2.0 已经接入 Pagefind，并在 `postbuild` 阶段生成索引。

## Decision

继续使用 Pagefind 作为站内搜索方案。

- 构建命令使用 `npm.cmd run build`。
- `postbuild` 执行 `pagefind --site dist`。
- 前端搜索组件按需加载 `/pagefind/pagefind.js`。
- 文章正文用 `data-pagefind-body` 标记索引范围。

## Consequences

优点：

- 不需要服务端。
- 构建后产物可部署到任意静态平台。
- 客户端按需加载搜索逻辑。

代价：

- 构建产物变大。
- 直接运行 `astro build` 会跳过索引生成。
- 搜索元信息需要通过页面 markup 额外维护。
