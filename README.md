# Yunis 的 Astro 博客

这是一个中文优先的个人博客项目，基于 Astro 官方 Blog 模板改造。站点用于记录开发、学习、项目和日常思考。

## 内容结构

```text
public/                 静态资源
src/assets/             图片和字体资源
src/components/         公共组件
src/content/blog/       Markdown / MDX 文章
src/layouts/            文章布局
src/pages/              页面路由
src/styles/global.css   全局样式
```

## 已启用能力

- 中文导航、首页、文章页、项目页、笔记页和关于页
- Markdown 与 MDX 文章
- RSS Feed
- Sitemap
- 本地字体与中文字体回退

## 常用命令

所有命令都在项目根目录运行：

```sh
npm install
npm run dev
npm run build
npm run preview
```

## 后续可补充

- 标签页和归档页
- 站内搜索
- 项目详情页
- 部署说明和自动化发布流程
