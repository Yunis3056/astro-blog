# Changelog

本项目遵循“人能读懂优先”的变更记录方式。还没有正式语义化发布时，版本号按路线图阶段记录。

## Unreleased · v4.0

### Added

- 知识系统：新增 `topics` 和 `series` 内容集合，以及 `/topics/`、`/series/` 路由。
- 内容模型：文章、笔记、项目支持 `topics`、`featured`；文章和笔记支持 `series`、`canonicalURL`。
- 首页升级：以精选内容、专题矩阵、系列路线和近期写作组织首屏后的阅读路径。
- 文章页升级：展示所属专题、系列进度、相关文章和 Giscus 评论入口。
- 搜索升级：Pagefind 增加内容类型、专题、标签过滤和日期排序。
- 增长闭环：可选接入 Giscus 和 Plausible，未配置时保持静态降级。
- 内容验证：新增 `npm.cmd run verify:content`，校验专题 / 系列引用和系列顺序冲突。

## v3.0 · 2026-05-24

### Planned

- 内容模型升级：系列、精选、规范化标签、项目和笔记内容集合评估。
- 发布流程升级：CI、链接检查、构建产物检查、部署文档。
- 阅读体验升级：404、相关文章、系列导航、搜索结果元信息。
- 运维文档升级：依赖升级、字体、OG、Pagefind、部署故障排查。

### Added

- `ROADMAP-v3.md`：v3.0 里程碑、范围和验收标准。
- `docs/`：架构、内容模型、写作、部署、质量、SEO、运维说明。
- ADR 草稿：内容模型、搜索索引、OG 图片生成方案。

## v2.0 · 2026-05-22

### Added

- 标签系统：`tags` frontmatter、`/tags/`、`/tags/[tag]/`、文章和列表标签 chip。
- 归档页：`/archive` 按时间组织公开文章。
- Pagefind 搜索：构建后生成索引，前端支持快捷键、弹窗、键盘导航。
- 手动明暗主题切换：首屏主题脚本、按钮切换、`localStorage` 记忆。
- View Transitions：启用 ClientRouter，并适配客户端交互重新绑定。
- 文章页增强：阅读时长、目录、阅读进度、上一篇 / 下一篇。
- Expressive Code：代码块主题、复制和展示增强。
- 动态 OG 图片：为公开文章生成 `/og/*.png`。
- RSS 增强：输出更完整的内容和元信息。
- 写作脚本：`npm.cmd run new "标题"` 创建文章草稿。
- 工程验证：`npm.cmd run check` 和 `npm.cmd run build`。

### Fixed

- 修复文章文件截断，恢复正文末尾内容。
- 修复 ClientRouter 切页后主题按钮和搜索绑定失效。
- 修复 `/blog/` 移动端 CSS 截断和标签 chip 样式问题。
- 修复 OG 图片生成包含草稿的问题。
- 修复中文 OG 字体渲染方框风险，使用本地字体资源。

### Verified

- `npm.cmd run check`
- `npm.cmd run build`
