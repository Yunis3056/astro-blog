# ADR 0002: 搜索索引使用 Pagefind

## 状态

Accepted，5.0 后继续有效。

## 决策

站内搜索继续使用 Pagefind。虽然 5.0 已经支持 SSR 和 Sanity 后台，但公开页面仍然预渲染，Pagefind 可以继续在构建后扫描静态输出。

## 影响

- `postbuild` 执行 `scripts/run-pagefind.mjs`。
- 搜索弹窗按需加载 `/pagefind/pagefind.js`。
- 草稿预览页面使用 `data-pagefind-ignore`，不进入搜索索引。
