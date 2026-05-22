# Yunis 的博客 · v2.0 路线图

> v1.0：中文化模板 + 极简视觉重做（已完成）
> v2.0 目标：把站点从"能看"升级到"能长期写、好被找到、有自己的味道"

---

## 北极星

一个我**自己愿意每周打开**的中文博客。
判断标准只有一个：写作摩擦低 + 旧文章容易被翻出来。

---

## 范围（在做什么 / 不做什么）

### 在做
- 提升写作 → 发布的体验
- 让旧文章可被检索（标签 / 搜索 / 归档）
- 视觉与交互的克制升级（页面过渡、代码块、暗色模式开关）
- 站点基础设施（OG 图、sitemap、analytics 可选项）

### 不做
- 评论系统（v2.0 用 GitHub Discussions 链接代替）
- 多语言 i18n（中文优先，英文版留到 v3）
- 服务端动态功能（保持纯静态）
- CMS / 后台编辑器

---

## P0 · 必做（M1 里程碑）

写作体验是这个版本的核心。这部分不做完，后面都白搭。

### 1. 标签系统
- **做什么**：frontmatter 加 `tags: [...]`，新增 `/tags/` 索引页 + `/tags/[tag]/` 详情页
- **验收**：文章卡片上能看到 tag chip；点击进入只显示该标签的文章
- **改动**：`src/content.config.ts`、新建 `src/pages/tags/index.astro` 和 `[tag].astro`、`src/pages/blog/index.astro` 加 chip
- **难度**：⭐⭐

### 2. 全站搜索
- **做什么**：用 [Pagefind](https://pagefind.app/) 在构建时生成索引，前端用其 UI 组件
- **验收**：⌘K 唤起搜索框，可命中文章正文
- **改动**：`astro.config.mjs` 加 integration、新增 `src/components/Search.astro`、Header 加触发按钮
- **难度**：⭐⭐

### 3. 文章模板
- **做什么**：`templates/` 目录放三个 frontmatter 模板：开发记录 / 项目复盘 / 学习总结
- **验收**：`npm run new "title"` 一行命令生成新文章草稿
- **改动**：根目录加 `scripts/new-post.mjs`，`package.json` 加 script
- **难度**：⭐

### 4. 代码块升级
- **做什么**：换成 [Expressive Code](https://expressive-code.com/)，支持文件名、行高亮、diff、复制按钮
- **验收**：代码块有文件名标签、可一键复制、暗色模式自适应
- **改动**：`astro.config.mjs` 加 `astro-expressive-code` integration
- **难度**：⭐

---

## P1 · 高价值（M2 里程碑）

### 5. 归档页
- **做什么**：`/archive` 按年/月分组，时间轴样式
- **难度**：⭐

### 6. View Transitions
- **做什么**：开启 Astro 内置的 `<ClientRouter />`，页面切换有平滑过渡
- **关键**：要保证 `Effects` 组件的脚本在路由切换后重新初始化（监听 `astro:page-load`）
- **难度**：⭐⭐

### 7. 自动生成 OG 图
- **做什么**：用 `@vercel/og` 或 `satori` 给每篇文章生成动态 OG 图（标题 + 日期 + 站名）
- **验收**：分享链接到微信 / Twitter 能显示带标题的卡片
- **难度**：⭐⭐⭐

### 8. 暗色模式手动开关
- **做什么**：Header 加日/夜切换按钮，记忆到 localStorage，覆盖系统偏好
- **改动**：`global.css` 把 `@media (prefers-color-scheme)` 改成 `[data-theme="dark"]` 选择器；Header 加按钮 + 内联无闪烁脚本
- **难度**：⭐⭐

### 9. 文章页增强
- 阅读时长（基于字数估算）
- 目录（TOC，sticky 在右侧）
- 阅读进度条（顶部细线）
- 上一篇/下一篇
- **难度**：⭐⭐

### 10. RSS 增强
- 在 Feed 里输出完整正文 HTML（当前只有摘要）
- 加 `<itunes:image>` / `<media:content>` 让阅读器显示封面
- **难度**：⭐

---

## P2 · 加分项（M3 / 看时间）

| # | 功能 | 价值 | 难度 |
|---|------|------|------|
| 11 | 草稿模式（`draft: true` 仅在 dev 显示） | 中 | ⭐ |
| 12 | 文章末尾 GitHub Discussions 链接（代替评论） | 中 | ⭐ |
| 13 | Webmention / 反向链接展示 | 低 | ⭐⭐⭐ |
| 14 | Umami / Plausible 隐私友好统计 | 中 | ⭐ |
| 15 | 项目详情页（每个项目独立路由） | 高 | ⭐⭐ |
| 16 | 笔记页改成 micro-blog 时间流 | 中 | ⭐⭐ |
| 17 | "正在听 / 在读"侧栏（手动更新 JSON） | 低 | ⭐ |
| 18 | 404 页彩蛋（动效或 ASCII 艺术） | 低 | ⭐ |

---

## 技术升级

- **Astro 6.x → 最新**：检查 [migration guide](https://docs.astro.build/en/guides/upgrade-to/)，关注 Content Layer API
- **图像**：把 `<Image>` 全部换成响应式 `srcset`，封面图用 AVIF + WebP
- **字体**：评估自托管思源宋体子集（中文字体很大，要做按需子集化）
- **CI**：加 GitHub Actions：PR 自动构建 + Lighthouse 检查（性能阈值 ≥ 95）
- **Lighthouse 目标**：性能 / 可访问性 / 最佳实践 / SEO 均 ≥ 95

---

## 里程碑

| 里程碑 | 包含 | 预计周期 |
|--------|------|---------|
| **M1** | P0 全部（标签 / 搜索 / 模板 / 代码块） | 1–2 周 |
| **M2** | P1 中选 3–5 项（推荐 5/6/8/9） | 2–3 周 |
| **M3** | 技术升级 + 任选 P2 | 视情况 |

每个里程碑发一篇文章总结，标 v2.0-m1 / v2.0-m2 tag。

---

## 风险与取舍

- **搜索 vs 包体积**：Pagefind 索引会增加构建产物，但客户端按需加载，可接受
- **OG 图**：动态生成要在构建期跑，会拖长 build 时间。如果文章 < 50 篇问题不大
- **View Transitions**：会让现有 `IntersectionObserver` 在路由切换后失效，必须监听 `astro:page-load` 重新初始化，否则二次进入页面 reveal 全挂
- **暗色模式手动开关**：要避免初始加载闪白，必须把读取 localStorage 的脚本放在 `<head>` 内联且早于样式

---

## 完成定义（v2.0 发布前）

- [ ] M1 全部完成
- [ ] M2 至少完成 3 项
- [ ] Lighthouse 四项 ≥ 95
- [ ] 写一篇 `v2.0-release.md` 总结改了什么、为什么这么改
- [ ] 把这份 ROADMAP 移动到 `archive/` 并新建 `ROADMAP-v3.md` 草稿
