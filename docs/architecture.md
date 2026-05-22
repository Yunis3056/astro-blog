# 架构说明

本文档描述当前项目结构和关键运行链路。目标是让后续 v3.0 改动有稳定参照。

## 技术栈

- Astro 6：静态站点生成、页面路由、内容集合。
- Astro MDX：支持 `.mdx` 文章。
- Astro Sitemap：生成 sitemap。
- Astro RSS：生成 RSS Feed。
- Expressive Code：代码块展示增强。
- Pagefind：构建后生成静态搜索索引。
- `@vercel/og`：构建期生成文章 OG 图片。

## 目录职责

```text
public/                 原样复制到构建产物的静态资源
scripts/                本地写作和维护脚本
src/assets/             Astro 管理的图片、字体等资源
src/components/         Header、Search、ThemeToggle、TagList 等组件
src/content/blog/       文章内容集合
src/layouts/            BlogPost 等布局
src/pages/              Astro 路由页面
src/styles/global.css   全局变量、主题和基础排版
docs/                   项目维护文档
```

## 页面路由

- `/`：首页。
- `/blog/`：公开文章列表。
- `/blog/[slug]/`：文章详情。
- `/tags/`：标签索引。
- `/tags/[tag]/`：标签详情。
- `/archive/`：归档页。
- `/projects/`：项目页。
- `/notes/`：笔记页。
- `/about/`：关于页。
- `/rss.xml`：RSS Feed。
- `/og/[slug].png`：文章 OG 图片。

## 内容流

1. 文章存放在 `src/content/blog/`。
2. `src/content.config.ts` 定义 frontmatter schema。
3. 页面通过 Astro content collections 读取文章。
4. 页面列表、标签、归档、RSS、OG 统一过滤 `draft: true`。
5. `npm.cmd run build` 生成静态 HTML 和资源。
6. `postbuild` 执行 Pagefind，生成搜索索引。

## 客户端脚本

项目启用了 ClientRouter。切页后 Astro 会替换当前 DOM，因此带交互的组件需要监听 `astro:page-load` 并重新绑定当前页面上的元素。

现有交互组件：

- `Search.astro`：搜索弹窗、快捷键、结果导航。
- `ThemeToggle.astro`：主题按钮和持久化。
- `Effects.astro`：页面动效。
- `BlogPost.astro` 内联脚本：阅读进度和目录高亮。

约束：

- 不使用只执行一次的全局 DOM 绑定来控制具体元素。
- 可以用元素级 `data-*Bound` 标记避免重复绑定同一个 DOM。
- 全局键盘事件可以只绑定一次，但内部要读取当前 DOM。

## 构建产物

- `dist/` 是静态站点输出目录。
- `dist/pagefind/` 是搜索索引目录。
- `dist/og/` 包含文章 OG 图片。

`dist/` 和 `.astro/` 属于生成产物，不应手动维护。
