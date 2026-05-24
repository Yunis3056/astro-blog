#!/usr/bin/env node
// 用法：npm run new -- "标题" [tag1,tag2] [-- type=dev|review|note]
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const title = args.find((a) => !a.startsWith('-')) || '未命名文章';
const tagsArg = args.find((a, i) => i > 0 && !a.startsWith('-')) || '';
const typeArg = (args.find((a) => a.startsWith('type=')) || 'type=dev').split('=')[1];

const slugify = (s) =>
	s.toLowerCase()
		.replace(/[\s_]+/g, '-')
		.replace(/[^a-z0-9一-龥-]/g, '')
		.replace(/-+/g, '-').replace(/^-|-$/g, '') || `post-${Date.now()}`;

const slug = slugify(title);
const today = new Date().toISOString().slice(0, 10);
const tags = tagsArg ? tagsArg.split(',').map((t) => `'${t.trim()}'`).join(', ') : '';

const templates = {
	dev: `---
title: '${title.replace(/'/g, "\\'")}'
description: ''
pubDate: '${today}'
tags: [${tags}]
topics: []
featured: false
draft: true
---

## 问题

要解决的具体问题是什么？

## 思路

考虑过哪些方案？为什么选这个？

## 实现

关键代码或步骤。

## 复盘

如果再来一次会怎么改？
`,
	review: `---
title: '${title.replace(/'/g, "\\'")}'
description: ''
pubDate: '${today}'
tags: [${tags}]
topics: []
featured: false
draft: true
---

## 背景

项目目标 / 时间 / 角色。

## 做了什么

按时间线列主要工作。

## 反思

- 做对了什么
- 哪里可以更好
- 下一步动作
`,
	note: `---
title: '${title.replace(/'/g, "\\'")}'
description: ''
pubDate: '${today}'
tags: [${tags}]
topics: []
featured: false
draft: true
---

`,
};

const tpl = templates[typeArg] || templates.dev;
const file = path.join('src/content/blog', `${slug}.md`);
if (fs.existsSync(file)) {
	console.error('已存在同名文件：', file); process.exit(1);
}
fs.writeFileSync(file, tpl);
console.log('✓ 已创建', file, `(类型: ${typeArg})`);
console.log('  draft: true — 发布前改成 false');
