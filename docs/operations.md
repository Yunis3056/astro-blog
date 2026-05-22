# 运维手册

本文档记录日常维护和故障排查流程。

## 日常维护节奏

每次集中修改前：

```sh
git status --short
npm.cmd run check
npm.cmd run build
```

每次发布后：

- 打开生产站点首页。
- 打开最新文章。
- 打开 `/rss.xml`。
- 测试搜索和主题切换。
- 抽查社交分享图。

## 依赖升级

建议流程：

1. 先读相关依赖的 release notes 或 migration guide。
2. 单独提交依赖升级，不混入功能改动。
3. 运行 `npm.cmd run check`。
4. 运行 `npm.cmd run build`。
5. 抽查搜索、OG、RSS 和主题切换。

重点关注：

- Astro major 版本。
- `astro-expressive-code` 主题 API。
- Pagefind 构建产物路径。
- `@vercel/og` 字体加载行为。

## 本地端口异常

如果 `npm.cmd run dev` 启动后浏览器看到旧内容或 404，可能是旧进程占用端口。

排查：

```powershell
Get-NetTCPConnection -LocalPort 4321
```

确认 PID 后再停止对应进程：

```powershell
Stop-Process -Id <PID>
```

不要盲目停止未知进程。

## Pagefind 异常

现象：

- 搜索弹窗提示索引未生成。
- `/pagefind/pagefind.js` 404。

处理：

1. 确认运行的是 `npm.cmd run build`，不是直接 `astro build`。
2. 确认 `dist/pagefind/` 存在。
3. 重新启动 preview 或 dev server。

## OG 字体异常

现象：

- 中文显示为方框。
- 构建时报字体读取错误。

处理：

1. 确认字体依赖已安装。
2. 确认 OG 生成代码加载的是本地字体。
3. 运行 `npm.cmd run build`。
4. 打开 `dist/og/*.png` 抽查。

## ClientRouter 交互异常

现象：

- 首次打开页面按钮可用，切换页面后失效。

处理原则：

- 组件脚本监听 `astro:page-load`。
- 对具体 DOM 元素使用 `data-*Bound` 标记。
- 全局事件只绑定一次，但每次触发时读取当前 DOM。
