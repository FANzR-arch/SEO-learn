# SEO × GEO 入门课 · 开发规划（PLAN.md）

一套纯静态、可交互的 SEO + GEO 入门课程。术语和事实优先对照 Google Search Central 官方文档、GEO 论文（arXiv 2311.09735）等公开资料（见 `references.html`），课程会明确标注教学简化。

## 站点现状（截至 2026-07-21）

- **进度：** 阶段一前 3 课已完成（01 什么是 SEO / 02 抓取索引排名 / 03 SERP 解剖），04–24 课待建（见下表）。
- **站点级已完成：** 设计系统（蓝色点缀 + 扁平方角）、深浅色主题、课程外壳（顶栏/进度/左侧栏）、术语表（38 词条）、参考资料页、404、favicon、OG meta。
- **待办（非课程内容）：** 部署（Vercel/GitHub Pages）→ 补 canonical/og:url、og-cover.jpg（1200×630）、（可选）git 仓库初始化、GSC 验证 + sitemap.xml。

## 架构

```
index.html             课程首页（CURRICULUM 数据驱动目录）
lessons/lesson-NN.html 每课 = 内容 HTML + 一段配置脚本
assets/
  css/site.css         设计令牌 + 组件样式
  js/
    theme.js           深浅色（head 同步加载防闪烁；切换时触发 SEO.redrawAll）
    shell.js           课程外壳：顶栏 / 进度 / 章节高亮 / 左侧栏
    widgets.js         交互组件库（见下）
```

**每课作者只写：正文 HTML + 若干 `SEO.widgets.xxx(容器, 配置)` + `SEO.initLesson({...})`。** 顶栏/进度/左侧栏全部由 shell 自动生成。

## 交互组件库（widgets.js）

| 组件 | 用途 | 状态 |
|---|---|---|
| serpPreview | 编辑 Title/Description，实时预览 + 像素级截断检测 | ✅ |
| serpAnatomy | 模拟 SERP，点按钮逐块高亮讲解（版块可配置） | ✅ |
| crawlerSim | 爬虫抓取模拟：链接图逐步抓取，孤岛页教学 | ✅ |
| ctrCurve | 排名位置 → 点击率柱状图 + 流量估算 | ✅ |
| quizChoice | 单选题 + 逐项解析 + 重做 | ✅ |
| fillBlank | 填空 + 判定 + 显示答案 | ✅ |
| htmlXray | 渲染视图 ⇄ HTML 标签视图切换高亮 | ⏳ L04 |
| intentSorter | 把关键词分到四个意图桶 | ⏳ L05 |
| kwExplorer | 种子词 → 长尾词扩展树 / 量与难度散点选词 | ⏳ L06–07 |
| headingTree | 标题层级树可视化 + 排错 | ⏳ L10 |
| linkFlow | 站内链接权重流动图 | ⏳ L12/L17 |
| robotsLab | 写 robots.txt 规则，测试 URL 是否被屏蔽 | ⏳ L13 |
| cwvMeter | 三个 Core Web Vitals 指标的直观模拟 | ⏳ L15 |
| schemaBuilder | 表单生成 JSON-LD + 富媒体预览 | ⏳ L16 |
| aiCiteSim | 生成引擎引用模拟：改内容特征看被引用概率变化 | ⏳ L21–22 |
| geoChecklist | GEO 技术自查清单（逐项勾选 + 讲解） | ⏳ L23–24 |

## 24 课 → 主组件 映射

| # | 课程 | 主组件 | 状态 |
|---|---|---|---|
| 01 | 什么是 SEO：自然结果与付费广告 | serpAnatomy（简化）/ ctrCurve / quiz / fillBlank | ✅ 完成 |
| 02 | 搜索引擎三步：抓取 → 索引 → 排名 | crawlerSim / trio / quiz / fillBlank | ✅ 完成 |
| 03 | 解剖搜索结果页（SERP） | serpAnatomy（完整）/ quiz / fillBlank | ✅ 完成 |
| 04 | 一个网页的 SEO 骨架 | htmlXray | ⏳ |
| 05 | 搜索意图：四种搜索目的 | intentSorter | ⏳ |
| 06 | 关键词研究：从种子词到长尾词 | kwExplorer | ⏳ |
| 07 | 搜索量、难度与机会 | kwExplorer（散点选词） | ⏳ |
| 08 | 关键词映射：一页答一个问题 | 拖配练习（映射表） | ⏳ |
| 09 | Title 与 Meta Description | serpPreview（进阶配置 + 写作练习） | ⏳ |
| 10 | 标题层级与内容结构 | headingTree | ⏳ |
| 11 | 内容质量与 E-E-A-T | 案例对比 + quiz | ⏳ |
| 12 | 内部链接、图片与 alt | linkFlow | ⏳ |
| 13 | robots.txt 与 meta robots | robotsLab | ⏳ |
| 14 | sitemap 与 canonical | crawlerSim（带 sitemap 变体） | ⏳ |
| 15 | 网站速度与 Core Web Vitals | cwvMeter | ⏳ |
| 16 | 结构化数据：Schema 入门 | schemaBuilder | ⏳ |
| 17 | 外链与权威：链接即投票 | linkFlow（跨站变体） | ⏳ |
| 18 | 白帽与黑帽 | 案例判定 quiz 流程 | ⏳ |
| 19 | 品牌与实体 | 实体图谱示意 | ⏳ |
| 20 | 什么是 GEO | 对比演示（传统 SERP vs AI 答案） | ⏳ |
| 21 | AI 怎么挑选引用来源 | aiCiteSim | ⏳ |
| 22 | 为 AI 写作：可引用的内容 | aiCiteSim（改写练习） | ⏳ |
| 23 | GEO 技术清单 | geoChecklist | ⏳ |
| 24 | 度量与闭环 | geoChecklist / GSC 界面导览 | ⏳ |

## 分阶段

- **Phase A（已完成）**：设计系统 + shell + 6 个基础组件 + 课程 01–03 + 术语表/参考资料/404。
- **Phase B**：阶段一收尾（04）+ 阶段二（05–08），建 htmlXray、intentSorter、kwExplorer。
- **Phase C**：阶段三（09–12），建 headingTree、linkFlow。
- **Phase D**：阶段四（13–16），建 robotsLab、cwvMeter、schemaBuilder。
- **Phase E**：阶段五（17–19）。
- **Phase F**：阶段六 GEO（20–24），建 aiCiteSim、geoChecklist——GEO 领域变化快，写作时先核对最新公开资料。

## 原则

- 官方口径、行业经验、教学示意三类内容分开标注（见 references.html 第 4 节）。
- 不引框架；组件全部手写 SVG/DOM，保持零依赖、双击即用。
- 每加一课：写 `lessons/lesson-NN.html` → 到 index.html 的 `CURRICULUM` 把该课 `live:true` + 填 `href` → 上一课的「下一课」按钮指过来。
- 免责声明每页保留；示例 SERP 与数字均为教学演示。
- GEO 部分（20–24）每次动笔前先搜一轮最新资料——这个领域半年就能变一轮。
