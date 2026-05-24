# Yunis 的 Astro 博客

这是一个中文优先的个人博客项目，基于 Astro 官方 Blog 模板改造。站点用于记录开发、学习、项目和日常思考，并围绕长期写作、内容发现和静态发布做了完整增强。

## 当前能力

- 中文导航、首页、文章页、项目页、笔记页、关于页
- Markdown / MDX 文章内容
- 专题页和系列页，把文章、笔记、项目组织成知识路径
- 标签页、标签详情页和归档页
- Pagefind 站内搜索，支持 `Ctrl+K` / `⌘K`、类型 / 专题 / 标签筛选和日期排序
- 手动明暗主题切换，并记忆到 `localStorage`
- 文章页阅读时长、目录、阅读进度、系列进度、相关文章、上一篇 / 下一篇
- 可选 Giscus 评论、Plausible 统计
- Expressive Code 代码块增强
- RSS Feed、Sitemap 和动态 OG 图片
- 草稿过滤，构建产物不发布 `draft: true` 内容
- 本地字体和中文字体回退

## 内容结构

```text
public/                 静态资源
scripts/                写作和维护脚本
src/assets/             图片和字体资源
src/components/         公共组件
src/content/blog/       Markdown / MDX 文章
src/content/topics/     专题定义
src/content/series/     系列定义
src/layouts/            页面和文章布局
src/pages/              页面路由
src/styles/global.css   全局样式与主题变量
docs/                   项目文档
```

## 常用命令

所有命令都在项目根目录运行。Windows PowerShell 下建议使用 `npm.cmd`。

```sh
npm install
npm.cmd run dev
npm.cmd run check
npm.cmd run verify:content
npm.cmd run build
npm.cmd run preview
npm.cmd run new "文章标题"
```

`npm.cmd run build` 会执行 Astro 构建，并通过 `postbuild` 生成 Pagefind 搜索索引。

## 文档入口

- [v4.0 路线图](./ROADMAP-v4.md)
- [v3.0 路线图](./ROADMAP-v3.md)
- [变更日志](./CHANGELOG.md)
- [架构说明](./docs/architecture.md)
- [内容模型](./docs/content-model.md)
- [写作流程](./docs/writing-workflow.md)
- [部署说明](./docs/deployment.md)
- [质量门禁](./docs/quality-gates.md)
- [SEO 与 Feed](./docs/seo-and-feeds.md)
- [运维手册](./docs/operations.md)

## 发布基线

v4.0 以“知识系统 + 讨论和度量”为目标：专题和系列负责组织内容，Pagefind 负责筛选发现，Giscus / Plausible 作为可选外部增长能力。
