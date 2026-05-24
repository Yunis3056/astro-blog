# 写作流程

本文档定义从创建草稿到发布文章的推荐流程。

## 创建文章

```sh
npm.cmd run new "文章标题"
```

脚本会在 `src/content/blog/` 下创建文章草稿。创建后先检查 frontmatter：

- `title` 是否符合最终标题。
- `description` 是否能作为列表摘要。
- `pubDate` 是否是预期日期。
- `tags` 是否使用规范标签。
- `topics` 是否引用已存在专题。
- `series` 是否引用已存在系列，且 `order` 不重复。
- `draft` 发布前是否改为 `false`。

## 本地预览

```sh
npm.cmd run dev
```

预览时重点检查：

- 文章正文是否完整。
- 标题层级是否从 `h2` 开始组织正文。
- 代码块是否有语言标识，必要时添加文件名。
- 图片是否有合理尺寸和说明。
- 标签、目录、上一篇 / 下一篇是否正常。
- 明暗主题下排版都可读。

## 发布前检查

```sh
npm.cmd run check
npm.cmd run verify:content
npm.cmd run build
```

检查项：

- 没有 Astro / TypeScript 诊断错误。
- 专题 / 系列引用通过验证。
- 构建成功。
- RSS、标签页、归档页不包含草稿。
- 搜索索引生成成功。
- OG 图片生成成功。

## 发布文章 checklist

- [ ] `draft: false`
- [ ] `description` 已写好
- [ ] `tags` 已规范化
- [ ] `topics` 已选择
- [ ] 如属于系列，`series.slug` 和 `series.order` 已确认
- [ ] 文章末尾没有临时笔记
- [ ] 移动端排版不溢出
- [ ] `npm.cmd run check` 通过
- [ ] `npm.cmd run build` 通过

## 写作建议

- 用标签表达主题，不用标签表达情绪。
- 一个文章只解决一个主要问题。
- 标题面向以后搜索的人，不只面向当天的自己。
- 技术文章保留版本、环境和关键命令。
- 复盘文章保留背景、决策、结果和后续动作。
