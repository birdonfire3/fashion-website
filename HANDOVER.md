# 虾导的艺术 - 接手记录（HANDOVER）

> **正式版位置**：`M:\虾导的艺术\网站\网站代码`（**当前生产线上**，tunnel → 8080 端口 → fashion.vfocus.com.cn）
> **测试版位置**：`M:\虾导的艺术\网站\测试版本`（**本地预览**，端口 8081，fire 浏览器直接看）
> **文档创建**：2026-06-10 21:03
> **最后更新**：2026-06-10 21:30
> **创建者**：启元q（QQBot 分身）
> **状态**：🆕 接手记录 v1.1

---

## 🚨 接手者必读（最重要）

### 1. 项目双版本结构（生产 vs 预览）

| 路径 | 角色 | 部署 | 访问 | 操作权限 |
|------|------|------|------|:--------:|
| `M:\虾导的艺术\网站\网站代码` | **正式版**（生产） | cloudflared tunnel → 8080 | `https://fashion.vfocus.com.cn` | ✅ **修改为主** |
| `M:\虾导的艺术\网站\测试版本` | **测试版**（预览） | 本地 HTTP 8081 | `http://localhost:8081` | ✅ **同步** |

### 2. 正确工作流（火鸡 2026-06-10 21:25 确认）

```
1️⃣ 改正式版（M:\虾导的艺术\网站\网站代码\）
        ↓
2️⃣ 修完测试（本地）—— 启元
        ↓
3️⃣ 没 bug → 同步到测试版（覆盖）—— 启元
        ↓
4️⃣ fire 启 8081 服务看预览（fire 自己启）
        ↓
5️⃣ fire 验证 → 没问题 → fire 自己重启 8080 正式版
```

**禁止**：
- ❌ 改测试版当基线
- ❌ 跳过"同步到测试版"这步
- ❌ 没经 fire 同意直接重启 8080 正式版服务

### 3. 我（启元q）犯过的错（避免重蹈）

| 时点 | 错误 | 后果 |
|------|------|------|
| 6/10 19:46 | 在 `C:\works\虾导的艺术\` 让 Claude Code 写 v2（深黑金） | 跟启元分身做的 v2（不同设计）完全冲突 |
| 6/10 20:30 | 让 Claude Code 写 v3（保留 v1 风格） | 启元分身已做 v2，方向也错 |
| 6/10 21:00 | 写错 HANDOVER 工作流（之前写"改测试版"） | 跟 fire 实际意图相反，已修正 |
| 失忆 | 不知道线上版本在 M 盘 | 浪费时间 + 搞错方向 |

**教训**：
- ❌ 永远不要假设"线上版本是什么"
- ✅ 永远先看 M 盘 / D 盘 / 网络位置 / CF Pages / Git remote
- ✅ 让 Claude Code 写代码前，先列出所有相关位置

---

## 🌐 Tunnel 设置（已整合）

### 1. cloudflared 配置文件

**位置**：`C:\Users\letou\.cloudflared\config.yml`

```yaml
tunnel: ec3dba0d-8dc8-4890-85d7-25e66261b14c
credentials-file: C:\Users\letou\.cloudflared\ec3dba0d-8dc8-4890-85d7-25e66261b14c.json
protocol: http2

ingress:
  - hostname: novel.vfocus.com.cn
    service: http://localhost:18793
  - hostname: fashion.vfocus.com.cn
    service: http://localhost:8080
  - service: http_status:404
```

**关键信息**：
- Tunnel ID：`ec3dba0d-8dc8-4890-85d7-25e66261b14c`
- 凭据文件：`C:\Users\letou\.cloudflared\ec3dba0d-8dc8-4890-85d7-25e66261b14c.json`
- **Tunnel 名**：`my-tunnel`
- **fashion.vfocus.com.cn → localhost:8080**（正式版线上）

### 2. cloudflared 凭据

**位置**：`C:\Users\letou\.cloudflared\`
- `cert.pem`（282 字节 / 2026-05-30）
- `config.yml`（329 字节 / 2026-06-08）
- `ec3dba0d-8dc8-4890-85d7-25e66261b14c.json`（175 字节 / 2026-05-30）

### 3. M 盘启动脚本（启元分身写的）

#### `M:\虾导的艺术\网站\start-website.ps1`（733 字节）
- 启动正式版 HTTP 服务（端口 8080）
- **fire 用**：`py -3.10 -m http.server 8080`
- 注意：要先 `Set-Location "M:\虾导的艺术\网站\网站代码"`

#### `M:\虾导的艺术\网站\start-complete.ps1`（1114 字节）
- **同时启动 cloudflared tunnel + 正式版 HTTP 服务**
- **fire 用**：`Start-Process cloudflared` + `py -3.10 -m http.server 8080`
- 这是**最完整的启动方式**

#### `M:\虾导的艺术\网站\启动测试服务器.ps1`（234 字节）
- 启动测试版 HTTP 服务（端口 8081）
- **fire 用**：`npx serve -l 8081`
- 注意：要先 `cd "M:\虾导的艺术\网站\测试版本"`

### 4. 部署对应表

| 域名 | 后端 | 对应版本 | 启动方式 |
|------|------|----------|----------|
| `https://fashion.vfocus.com.cn` | `localhost:8080` | **正式版**（`网站代码`）| `start-website.ps1` 或 `start-complete.ps1` |
| `http://localhost:8081` | 本地 8081 | **测试版**（`测试版本`）| `启动测试服务器.ps1` |
| `https://novel.vfocus.com.cn` | `localhost:18793` | 小说助手（无关本项目）| 别的脚本 |

### 5. M 盘根 README 信息

**位置**：`M:\虾导的艺术\README.md`（启元分身 6/8 18:10 写，已过时）

**关键信息**：
- 项目启动：2026-06-08
- 类型：AI 摄影师作品展示网站
- 域名：fashion.vfocus.com.cn
- 项目根：`M:\虾导的艺术\`
  - `网站\网站代码\`（正式版）
  - `网站\测试版本\`（测试版）
  - `config\`（minimax_config.json - AI 生图 API 配置）
  - `README.md`（项目根说明）

### 6. config 目录

**位置**：`M:\虾导的艺术\config\minimax_config.json`
- minimax image-01 API
- API key 已配置
- 默认 1024x1024
- 用途：生成 AI 模特 / 作品图

---

## 📁 正式版完整结构

```
M:\虾导的艺术\网站\网站代码\    ← 正式版（生产线上）
├── index.html              # 7776 字节 / 2026-06-09 10:51
├── README.md               # 3569 字节 / 2026-06-08 18:10（v1.0 描述，已过时）
├── css\
│   ├── style.v2.css        # 5142 字节 / 2026-06-08 21:47（基础样式）
│   ├── style-pc.v2.css     # 12905 字节 / 2026-06-09 10:31（PC 端）
│   └── style-mobile.v2.css # 7535 字节 / 2026-06-09 10:56（移动端）
├── js\
│   └── main.v2.js          # 16319 字节 / 2026-06-09 10:53（主逻辑）
└── images\
    └── 00001.png ~ 00043.png  # 43 张真实图片（6/7-6/9）
```

### 启元分身工作记录（6/8-6/9）

| 时间 | 事件 |
|------|------|
| 6/8 18:10 | 写 README（v1.0 描述，未更新） |
| 6/8 18:14 | 项目正式启动（虾导艺术调研） |
| 6/8 18:14-22:00 | 制作 30+ 张图片 |
| 6/8 21:47 | 写 style.v2.css（基础样式） |
| 6/9 10:31 | 写 style-pc.v2.css（12.9KB PC 端样式） |
| 6/9 10:51 | 修改 index.html（7.7KB） |
| 6/9 10:53 | 写 main.v2.js（16.3KB 主逻辑） |
| 6/9 10:56 | 写 style-mobile.v2.css（7.5KB 移动端样式） |

### 启元分身的设计选择

| 设计项 | 选择 | 原因 |
|--------|------|------|
| **响应式** | PC 端 + 移动端 分离 CSS（不用媒体查询在单文件） | 移动端 UX 差异大 |
| **PC 端交互** | 横向滚动（参考 Lasse Pedersen 风格） | 作品集网站常见 |
| **移动端交互** | 竖向滚动（参考 SIR 风格） | 移动端自然 |
| **图片数量** | 43 张真实图 | 不用占位符 |
| **JS 文件** | 单文件 16KB | 不分模块（项目小） |

---

## 🐛 当前正式版 Bug 清单（6/10 21:03 接手时发现）

### 🔴 Bug #1: HTML 重复元素（最严重！）

**重复的 id**（HTML 规范要求 id 唯一）：

| 重复的 id | 出现次数 | 位置 |
|----------|:--------:|------|
| `mobileGallerySection` | 2 次 | 第 51-55 行 + 第 117-121 行 |
| `mobileGallery` | 2 次 | 同上 |
| `about` | 2 次 | `about-section` + `content-block.about-block` |
| `contact` | 2 次 | `contact-section` + `content-block.contact-block` |

**后果**：
- `getElementById('mobileGallerySection')` 只返回**第一个**
- 第一个在 PC 端 `gallerySection` 里（移动端 CSS 隐藏）
- 第二个是**移动端实际显示**的那个
- 移动端 JS 把图片加到第一个（隐藏的）→ **移动端看不到图片！**

### 🟠 Bug #2: 导航 `href="#"` 和 `#cases` 无效

```html
<a href="#" class="nav-link active">作品</a>          <!-- 跳顶部 -->
<a href="#cases" class="nav-link">案例</a>             <!-- 不存在 -->
```

- "作品" 跳到页面顶部（不是 #works）
- "案例" 指向不存在的 `#cases`

### 🟠 Bug #3: 导航 5 项 vs 内容 4 块不匹配

| 导航项 | 指向 | PC 端内容块 |
|--------|------|-------------|
| 关于 | `#about` | ✅ about-block |
| 服务 | `#capability` | ✅ capability-block |
| 作品 | `#` (错) | ❌ 没有 works-block |
| 案例 | `#cases` (错) | ❌ 没有 cases-block |
| 联系 | `#contact` | ✅ contact-block |

**少 2 个内容块**（作品 / 案例）

### 🟠 Bug #4: `window.pcImageLoader` 未定义

```javascript
function loadMoreImagesIfNeeded() {
    if (!window.pcImageLoader) return;  // 永远 return！
    ...
}
```

- `window.pcImageLoader` 从未定义
- 动态加载功能失效
- 但 `loadPCImages()` 一次性加载了 43 张图，所以**没崩**
- **性能问题**：一次性 43 张大图加载

### 🟡 Bug #5: ESC 不能关闭 lightbox

```javascript
overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target === closeBtn) {
        overlay.remove();
    }
});
// 没有 keydown 监听 ESC
```

### 🟡 Bug #6: about/contact 内容重复

- `about-section` (27-44 行) + `about-block` (90-101 行) 内容基本相同
- `contact-section` (124-135 行) + `contact-block` (113-118 行) 也重复

### 🟡 Bug #7: 编号不连续

- content-block: 01/02/03/04
- 独立 section: 06（contact-section）
- **缺 05**

### 修复优先级

| 优先级 | Bug | 说明 |
|:------:|-----|------|
| 🔴 P0 | 重复 id → 移动端无图 | **功能崩溃** |
| 🟠 P1 | 导航 # 和 #cases | 导航坏 |
| 🟠 P1 | `window.pcImageLoader` 未定义 | 性能 |
| 🟡 P2 | ESC 关闭 lightbox | UX |
| 🟡 P2 | about/contact 重复 | 代码冗余 |
| 🟢 P3 | 编号 05 缺失 | 美观 |

---

## 🤖 给未来 Claude Code 接手的规范

### 写代码前的强制检查

1. **先看正式版**：`M:\虾导的艺术\网站\网站代码\`
   - 列所有文件
   - 读 index.html / style-*.v2.css / main.v2.js
   - 了解启元分身做了什么

2. **先看测试版**：`M:\虾导的艺术\网站\测试版本\`
   - 跟正式版对比，看有什么差异
   - 读 HANDOVER.md（本文件）

3. **绝对不要**
   - ❌ 在 `C:\works\` 等其他位置写代码
   - ❌ 假设"线上跑的是什么"
   - ❌ 整盘重做设计

4. **改代码位置**
   - **改正式版** `M:\虾导的艺术\网站\网站代码\`（基线）
   - 修完通知启元同步到测试版
   - 启元同步完后 fire 启 8081 看

### 代码注释规范（强制）

**每个 JS 文件顶部必须有文档块**：
```javascript
/*
 * 虾导的艺术 - 文件名
 * 
 * 作用：[一句话说明]
 * 创建：[创建者] / [创建日期]
 * 最后修改：[修改者] / [修改日期]
 * 关联文件：[相关的其他文件]
 * 
 * 改动历史：
 * - 2026-06-XX [作者] [改动说明]
 */
```

**每个函数必须有 JSDoc**：
```javascript
/**
 * 函数名：[函数名]
 * 作用：[一句话]
 * 参数：
 *   - param1: [说明]
 *   - param2: [说明]
 * 返回：[说明]
 * 副作用：[说明，比如修改 DOM / 触发事件]
 * 调用方：[谁会调用]
 */
function functionName(param1, param2) {
    // ...
}
```

**关键变量必须注释**：
```javascript
// TOTAL_IMAGES: 43 张图（00001.png ~ 00043.png）
const TOTAL_IMAGES = 43;

// isMobile: true=移动端竖向滚动，false=PC 端横向滚动
const isMobile = ...;
```

**关键代码段必须注释**：
```javascript
// 一次性加载所有图片（性能考虑：43 张图不算大）
// 如果将来超过 100 张，要改成懒加载
for (let i = 1; i <= TOTAL_IMAGES; i++) {
    // ...
}
```

**Bug 修复必须注释为什么**：
```javascript
// Bug Fix: 重复 id 导致移动端看不到图片
// 原因：HTML 规范要求 id 唯一
// 修复：删掉重复的 section
// 修复者：xxx / 2026-06-XX
```

### HTML 注释规范

**每个 section 顶部**：
```html
<!-- 
  Section: [section 名]
  作用：[一句话]
  显示条件：PC/移动/两者
  关联 JS：[main.v2.js 的哪个函数]
-->
<section id="...">
```

**重复 id 必须删除**（HTML 规范要求 id 唯一）：
```html
<!-- 错误：id 重复 -->
<div id="gallery"></div>
<div id="gallery"></div>

<!-- 正确：id 唯一 -->
<div id="gallery-pc"></div>
<div id="gallery-mobile"></div>
```

### CSS 注释规范

**每个文件顶部**：
```css
/* 
 * 虾导的艺术 - style-pc.v2.css
 * 
 * 作用：PC 端样式（min-width: 769px）
 * 创建：启元分身 / 2026-06-09
 * 最后修改：xxx / 2026-XX-XX
 */
```

**关键样式必须注释**：
```css
/* Hero 首屏：3.5s 后自动隐藏（由 JS 控制） */
.hero-section { ... }
```

---

## 📞 联系方式 / 决策者

| 角色 | 名字 | 决策权限 |
|------|------|----------|
| **人类** | 火鸡 | 最终决策者（部署、改正式版、启停服务） |
| **大虾王** | 启元 | 协调、记录、修复（改正式版 + 同步测试版） |
| **专一虾** | 虾导 | 项目负责人（作品方向） |
| **AI 工具** | Claude Code | 代码执行（按规范） |

**绝对不要**：
- ❌ Claude Code 改其他位置
- ❌ 启元擅自启 8080 正式版服务
- ❌ 启元擅自改 tunnel 配置

---

## 🔗 相关文档

| 文档 | 位置 | 状态 |
|------|------|:----:|
| 正式版 README | `M:\虾导的艺术\网站\网站代码\README.md` | **已过时**（v1.0 描述）|
| 测试版 README | `M:\虾导的艺术\网站\测试版本\README.md` | 含 EmailJS 配置 |
| 本 HANDOVER | `M:\虾导的艺术\网站\测试版本\HANDOVER.md` | v1.1 |
| 启元核心记忆 | `C:\Users\letou\.openclaw\workspace\MEMORY.md` | 含虾导摘要 |
| 启元 6/10 日志 | `C:\Users\letou\.openclaw\workspace\memory\2026-06-10.md` | 含详细工作记录 |
| M 盘根 README | `M:\虾导的艺术\README.md` | **已过时** |

---

## 🆕 接手检查清单（未来新接手者必做）

- [ ] 读正式版 README.md
- [ ] 读测试版 HANDOVER.md（本文件）
- [ ] 读正式版 index.html
- [ ] 读正式版 js/main.v2.js
- [ ] 读正式版 css/style-*.v2.css
- [ ] 列正式版 images/ 下的图片
- [ ] **改正式版**（基线）
- [ ] 改完按"代码注释规范"加注释
- [ ] **不要**在其他位置写代码
- [ ] 通知启元同步到测试版
- [ ] fire 启 8081 看预览

---

**创建时间**：2026-06-10 21:03
**最后更新**：2026-06-10 21:30
**创建者**：启元q
**版本**：v1.1
**下次更新**：修完 bug 后

🔖 永久记录于 MEMORY.md
