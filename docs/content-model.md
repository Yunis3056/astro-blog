# 内容模型

内容模型以 Sanity schema 为准，入口在 `sanity/schemaTypes/`。

## 文档类型

| 类型 | 用途 |
| --- | --- |
| `post` | 长文章 |
| `note` | 短笔记 |
| `project` | 项目记录 |
| `topic` | 高层知识专题 |
| `series` | 连续阅读路径 |
| `siteSettings` | 站点设置单例 |

## 关键字段

- `post` / `note`：`title`、`slug`、`description`、`pubDate`、`updatedDate`、`tags`、`topics`、`series`、`featured`、`canonicalURL`、`body`。
- `project`：`title`、`slug`、`description`、`status`、`stack`、`order`、`repoUrl`、`demoUrl`、`topics`、`featured`、`body`。
- `topic` / `series`：`title`、`slug`、`description`、`order`、`featured`。
- 图片：统一使用 Sanity image asset，并要求 `alt`。
- 正文：统一使用 Portable Text，不再运行时支持 MDX。

## 约束

- 公开内容必须有 `slug.current`。
- `topics` 必须引用存在的 `topic`。
- `series.series` 必须引用存在的 `series`。
- 同一 `series` 内公开 `post` / `note` 的 `series.order` 不能重复。
- 草稿由 Sanity Draft 管理，不再使用 frontmatter `draft` 字段。
