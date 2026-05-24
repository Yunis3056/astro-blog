# 质量门禁

本文档定义 v3.0 以后每次发布前应执行的检查。

## 必须通过

```sh
npm.cmd run check
npm.cmd run build
npm.cmd run verify:dist
npm.cmd run verify:links
```

要求：

- Astro / TypeScript 无诊断错误。
- Astro 构建退出码为 0。
- Pagefind `postbuild` 成功执行。
- 构建产物检查确认 RSS、Sitemap、Pagefind、OG 和公开内容页面存在。
- 内部链接检查确认站内链接、图片路径和锚点目标可解析。

GitHub Actions 会在 `dev` 和 `main` 的 push / pull request 上运行同一套验证命令。该工作流只做验证，不负责自动部署。

## 内容完整性

- 新文章没有截断。
- `draft: true` 不出现在公开页面和构建产物入口。
- 文章末尾没有 TODO、临时链接或未完成段落。
- 标签展示不带 `#`，不显示文章数量。

## 交互验证

至少手动检查：

- 首屏主题按钮可切换并写入 `localStorage`。
- 从首页跳到博客页、文章页后主题按钮仍可用。
- `Ctrl+K` / `⌘K` 可打开搜索。
- 搜索输入后结果可展示。
- 方向键和 Enter 可操作搜索结果。
- 文章目录和阅读进度正常。

## 构建产物验证

`npm.cmd run verify:dist` 会检查 `dist/`：

- `dist/pagefind/` 存在。
- 公开文章有对应 HTML。
- 公开文章有对应 OG 图片。
- 草稿没有对应公开 HTML、RSS 条目、标签入口和 OG 图片。
- Pagefind 索引数量和公开内容详情页数量一致。

## 链接验证

`npm.cmd run verify:links` 会检查构建后的 HTML：

- 站内页面链接可以解析到 `dist/` 中的 HTML 或静态资源。
- 相对链接和站点绝对链接都会按内部链接处理。
- URL hash 会验证目标页面是否存在对应 `id` 或 `name`。
- 外部链接第一版不阻塞发布，暂时只跳过并统计数量。

## 响应式验证

至少检查这些视口：

- 375px 宽手机。
- 768px 宽平板。
- 1280px 宽桌面。

重点页面：

- `/`
- `/blog/`
- `/blog/[slug]/`
- `/tags/`
- `/tags/[tag]/`
- `/archive/`

要求：

- 文本不溢出容器。
- 标签 chip 不换出屏幕。
- Header 横向滚动可用。
- 文章页 TOC 在小屏隐藏或不阻挡正文。

## SEO 和 Feed 验证

- 每个页面有合理 title 和 description。
- RSS 只包含公开文章。
- Sitemap 不包含草稿。
- OG 图片中文不显示方框。
- 分享图标题、日期、站点名可读。
