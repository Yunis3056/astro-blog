# Yunis 的 Astro 博客

这是一个中文优先的个人博客项目，基于 Astro 官方 Blog 模板改造。站点用于记录开发、学习、项目和日常思考，并围绕长期写作、内容发现和静态发布做了完整增强。

## 当前能力

- 中文导航、首页、文章页、项目页、笔记页、关于页
- Markdown / MDX 文章内容
- 标签页、标签详情页和归档页
- Pagefind 站内搜索，支持 `Ctrl+K` / `⌘K`
- 手动明暗主题切换，并记忆到 `localStorage`
- 文章页阅读时长、目录、阅读进度、上一篇 / 下一篇
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
npm.cmd run build
npm.cmd run preview
npm.cmd run new "文章标题"
```

`npm.cmd run build` 会执行 Astro 构建，并通过 `postbuild` 生成 Pagefind 搜索索引。

## v3.0 文档入口

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

v2.0 已完成标签、搜索、归档、主题切换、文章页增强、动态 OG、RSS 增强和基础验证入口。v3.0 的重点是把这些能力固化成可维护的发布系统，再扩展内容模型、自动化质量检查和长期运维流程。
