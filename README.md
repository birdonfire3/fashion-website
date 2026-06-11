# 虾导的艺术 - AI Photographer

> **AI 摄影师作品展示网站**  
> 线上版：https://fashion.vfocus.com.cn

---

## 📋 项目概述

| 项目 | 内容 |
|------|------|
| **域名** | fashion.vfocus.com.cn |
| **类型** | AI 摄影师作品展示 + AI 视觉创作服务 |
| **设计风格** | PC 端：Lasse Pedersen 横向滚动 / 移动端：SIR 风格瀑布流 |
| **当前版本** | v2.1（2026-06-10） |
| **正式版路径** | `M:\虾导的艺术\网站\网站代码` |
| **测试版路径** | `M:\虾导的艺术\网站\测试版本` |

---

## 📁 文件结构

```
网站代码\
├── index.html              (9073 字节)  主页面（PC + 移动端响应式）
├── README.md               (本文件)
├── css\
│   ├── style-pc.v2.css     (11369 字节)  PC 端样式（横向滚动）
│   ├── style-mobile.v2.css (7984 字节)   移动端样式（竖向瀑布流）
│   └── style.v2.css        (5142 字节)   ⚠️ 历史版本（v2 早期草稿，未引用，可删除）
├── js\
│   └── main.v2.js          (17183 字节)  核心逻辑（设备检测 + 导航 + lightbox）
└── images\
    └── 00001.png ~ 00043.png   (43 张真实图，6/7-6/9 制作)
```

---

## 🐛 当前 Bug 状态（修复中）

| 优先级 | Bug | 状态 | 修复版本 |
|:------:|-----|:----:|----------|
| 🔴 P0 | HTML 重复 id → 移动端无图 | ✅ | 6/10 21:44 |
| 🔴 P0 | 版权信息跑到 top | ⏳ 修复中 | 6/10 23:00 |
| 🟠 P1 | 导航 # 和 #cases 无效 | ✅ | 6/10 21:48 |
| 🟠 P1 | `window.pcImageLoader` 未定义 | ✅ | 6/10 21:48 |
| 🟠 P1 | 移动端图片点击 lightbox 不响应 | ⏳ 修复中 | 6/10 23:00 |
| 🟠 P1 | 移动端导航 #about / #contact 跳不动 | ⏳ 修复中 | 6/10 23:00 |
| 🟡 P2 | ESC 关闭 lightbox | ✅ | 6/10 21:48 |
| 🟡 P2 | 跨端区块未隐藏 | ✅ | 6/10 21:48 |
| 🟢 P3 | 编号缺 05 | ✅ | 6/10 21:48 |

---

## 🔄 启动方式

### 正式版（HTTP 8080，线上）
```powershell
# 方法 1：直接启 HTTP（需要 cloudflared 已在跑）
M:\虾导的艺术\网站\start-website.ps1

# 方法 2：完整启动（HTTP + Tunnel）
M:\虾导的艺术\网站\start-complete.ps1
```

### 测试版（HTTP 8081，本地预览）
```powershell
M:\虾导的艺术\网站\启动测试服务器.ps1
# 访问 http://localhost:8081
```

### Cloudflare Tunnel（域名访问）
```powershell
cloudflared tunnel run my-tunnel
# 访问 https://fashion.vfocus.com.cn
```

---

## 🎨 设计语言

### PC 端（Lasse Pedersen 风格）
- 横向滚动（鼠标滚轮 → 横向 translateX）
- 首屏文字动画（"虾导" + AI PHOTOGRAPHER）
- 横向排列：43 张图片 + 5 个文字区块（关于/服务/案例/数据/联系）
- 导航栏：透明 → 2.5s 后淡入
- **Footer 固定在 viewport 底部**（v2.1 修复）

### 移动端（SIR 风格）
- 竖向滚动
- 首屏：关于 + 图片瀑布流 + 联系
- 导航栏：白底固定顶部
- 4 个独立区块：关于 / 图片 / 联系

---

## 🔧 技术栈

| 组件 | 技术 |
|------|------|
| HTML | 静态 HTML 5 |
| CSS | 原生 CSS 3（响应式，media query）|
| JavaScript | 原生 JS（无框架）|
| HTTP | Python 3.10 http.server / npx serve |
| CDN | Cloudflare Tunnel |
| 域名 | vfocus.com.cn 子域名 |
| 部署 | fashion.vfocus.com.cn |

---

## 📝 v2.1 主要改进（2026-06-10）

### 启元分身 6/8-6/9 做的 v2
- 三套 CSS（base/pc/mobile 响应式）
- 专业 JS（17KB）— 设备检测 + 横向滚动 + lightbox + 导航
- 43 张真实图片（不是占位符）
- 完整的 PC + 移动端适配

### 启元 6/10 修的 Bug
- ✅ 修 HTML 重复 id（解决移动端无图问题）
- ✅ 修导航锚点（initNavigation 重写）
- ✅ 修 lightbox ESC 关闭
- ✅ 修跨端区块未隐藏
- ✅ 修编号缺 05
- ✅ 清理冗余 console.log
- ⏳ 修版权跑到 top（v2.1 修复中）
- ⏳ 修移动端图片点击 + 导航

### 启元 6/10 补的内容
- ⏳ README.md v1.0 → v2.1（本文件）
- ⏳ HANDOVER.md（接手文档）
- ✅ backup 正式版 + 测试版

---

## 📚 相关文档

| 文档 | 位置 |
|------|------|
| 网站文案 | `M:\虾导的艺术\网站\网站文案-中文版.md`（8.2KB）|
| 接手文档 | `M:\虾导的艺术\网站\测试版本\HANDOVER.md`（14.3KB）|
| 启动脚本 | `M:\虾导的艺术\网站\start-*.ps1` |
| 备份目录 | `M:\虾导的艺术\网站\版本备份\` |
| 配置 | `M:\虾导的艺术\config\minimax_config.json` |
| Tunnel | `C:\Users\letou\.cloudflared\config.yml` |

---

## 🤝 接手者必读

1. **项目文件夹** = `M:\虾导的艺术`（可读可写）
2. **工作流**：改正式版 → 备份 → 同步测试版 → 火鸡启 8081 看
3. **不要重做设计**（保留 PC 横向 + 移动竖向）
4. **不要改图片路径**（`images/00001.png` ~ `00043.png`）
5. **不要改 CSS 类名**（JS 用 querySelector 选）
6. **必须按 HANDOVER.md 注释规范**（文件头 + JSDoc + 关键变量 + BugFix 注释）

---

**最后更新**：2026-06-10 23:00（启元更新）  
**创建时间**：2026-06-08 18:10（启元分身 v1）  
**维护者**：启元（AI）/ 火鸡（最终决策）
