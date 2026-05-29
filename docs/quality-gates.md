# 质量门禁

## 必跑命令

```sh
npm.cmd run check
npm.cmd run verify:cms
npm.cmd run build
npm.cmd run verify:dist
npm.cmd run verify:links
```

## CMS 检查

`verify:cms` 会检查：

- 专题和系列存在。
- 公开文档有 slug。
- 专题引用和系列引用可解析。
- 系列顺序为正整数。
- 同一系列内公开文章/笔记顺序不重复。

## 构建产物检查

`verify:dist` 会检查：

- 首页、RSS、Sitemap、Pagefind 文件存在。
- RSS 不包含本地文件系统路径。
- Pagefind 索引非空。
- 关键公开入口进入 Sitemap。

## 人工验收

- `/admin` 可登录。
- 草稿可在 `/preview/[kind]/[slug]/` 查看，公开页不包含草稿。
- `/topics/`、`/series/`、文章页、笔记页、项目页无移动端溢出。
- 发布 Sanity 文档后 Vercel 自动重建。
