# SEO × GEO · 入门课

一套面向**完全新手**的、可交互的 SEO（搜索引擎优化）+ GEO（生成引擎优化）入门课程。纯静态网站，无需后端、无需构建工具，双击即可看，任意静态托管即可上线。

> 这也是作者自己的学习记录：从零开始入门 SEO/GEO，边学、边做课、边分享。

## 目录结构

```
SEO-learn/
├── index.html              课程首页（CURRICULUM 数据驱动目录 + 可玩的 SERP 预览器）
├── glossary.html           术语表（可搜索、按分类筛选）
├── references.html         参考资料、课程简化原则与适用边界
├── 404.html                自定义 404 页
├── favicon.svg             站点图标（放大镜 + 排名柱）
├── lessons/
│   └── lesson-01.html … lesson-03.html   已上线的 3 课
├── assets/
│   ├── css/site.css        全站共享样式（设计令牌 + 组件，扁平清爽）
│   ├── fonts/              自托管 Inter / JetBrains Mono（拉丁子集）
│   └── js/
│       ├── theme.js        深浅色主题（head 中同步加载，防闪烁）
│       ├── shell.js        课程外壳：顶栏 / 进度 / 章节高亮 / 左侧栏 / 上下课
│       └── widgets.js      交互组件库（serpPreview / serpAnatomy / crawlerSim / ctrCurve / quiz / fillBlank）
├── PLAN.md                 开发规划（24 课 → 组件 映射）
└── README.md
```

- **改样式** → 只动 `assets/css/site.css`，全站生效。
- **改交互组件** → 只动 `assets/js/widgets.js`（`window.SEO.widgets`）。
- **加新课** → 在 `lessons/` 下复制现有课改内容，再到 `index.html` 的 `CURRICULUM` 数组里把对应课程的 `live:true` 打开、填上 `href`。

## 站点特性

- **零依赖**：无框架、无构建、无第三方 JS，所有组件手写 SVG/DOM。
- **深浅色**：随系统自动切换 + 顶栏手动开关（记住选择）；SVG 组件换主题自动重绘。
- **无障碍**：skip-link、键盘焦点环、图表 `role="img"` + `aria-label`、`prefers-reduced-motion`。
- **分享卡片**：每页 Open Graph / Twitter meta。
- **视觉**：扁平方角、黑色主按钮、蓝色点缀，紧凑清爽。

## 课程体系（六阶段 / 24 课）

1. **地基 · 搜索是怎么工作的**：什么是 SEO → 抓取/索引/排名 → SERP 解剖 → 网页骨架
2. **关键词与搜索意图**：意图四分类 → 关键词研究 → 量与难度 → 关键词映射
3. **页面优化 On-Page**：Title/Description → 标题层级 → E-E-A-T → 内链与图片
4. **技术 SEO**：robots → sitemap/canonical → Core Web Vitals → 结构化数据
5. **站外信号与权威**：外链与 PageRank → 白帽黑帽 → 品牌与实体
6. **GEO · 生成引擎优化**：什么是 GEO → AI 如何选引用 → 为 AI 写作 → 技术清单 → 度量闭环

目前**前 3 课已上线**（阶段一前 3 课），其余在 `index.html` 的 `CURRICULUM` 中登记、逐课上线（详见 `PLAN.md`）。

## 本地预览

直接双击 `index.html` 即可。若个别浏览器对本地 JS 有限制，可用任意静态服务器：

```bash
# 任选其一，在项目根目录执行
python -m http.server 8080      # 然后浏览器打开 http://localhost:8080
npx serve .
```

## 部署

所有资源都用**相对路径**，可放进任意静态托管（Vercel / GitHub Pages / Netlify 等），构建命令留空、发布目录填根目录即可。上线后记得：

1. 在各页面 `<head>` 补上 `canonical` 与 `og:url`（当前留空，等定域名）；
2. 制作 `og-cover.jpg`（1200×630）补全分享卡片；
3. 提交 sitemap 到 Google Search Console——正好当第 24 课的实操作业。

## 免责声明

本课程用于 SEO / GEO 知识的入门学习。搜索引擎与 AI 产品的算法不公开且持续变化，课程内容基于公开资料与教学简化，数字多为示意；实际效果因行业、语言与站点而异，不构成对任何站点排名效果的承诺。主要来源与简化原则见 `references.html`。
