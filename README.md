# 虾导的艺术 - 网站代码技术文档

> **AI 摄影师作品展示网站**  
> 线上版：https://fashion.vfocus.com.cn  
> 当前版本：V7 Final（2026-06-12 22:40）

---

## 📋 项目概述

| 项目 | 内容 |
|------|------|
| **域名** | fashion.vfocus.com.cn |
| **类型** | AI 摄影师作品展示 + AI 视觉创作服务 |
| **设计风格** | PC 端：Lasse Pedersen 横向滚动 / 移动端：SIR 风格瀑布流 |
| **当前版本** | V7 Final（2026-06-12）|
| **正式版路径** | `M:\虾导的艺术\网站\网站代码` |
| **测试版路径** | `M:\虾导的艺术\网站\测试版本` |
| **GitHub仓库** | `https://github.com/birdonfire3/xiadao-website.git`（⏳ 待创建）|

---

## 📁 文件结构

```
网站代码\
├── index.html                    (13637 bytes)  主页面（PC + 移动端响应式）
├── README.md                     (本文件)       技术文档
├── HANDOVER.md                   (14385 bytes)  接手文档
├── css\
│   ├── style-pc.v2.css          (12905 bytes)  PC 端样式（横向滚动）
│   ├── style-mobile.v2.css      (9612 bytes)   移动端样式（竖向瀑布流）
│   └── style.v2.css             (5142 bytes)   基础样式（通用）
├── js\
│   └── main.v2.js               (31251 bytes)  核心逻辑（设备检测 + 导航 + 视频播放）
└── images\
    ├── m1.mp4                   (3.16 MB)      PC端hero视频
    ├── m1-poster.jpg            (108.8 KB)     hero视频首帧
    ├── m1-mobile.mp4            (1.8 MB)       移动端视频1
    ├── m1-mobile-poster.jpg     (109 KB)       移动端视频1首帧
    ├── m2-mobile.mp4                           移动端视频2
    ├── m2-mobile-poster.jpg     (111.1 KB)     移动端视频2首帧
    ├── m3-mobile.mp4                           移动端视频3
    ├── m3-mobile-poster.jpg     (116.6 KB)     移动端视频3首帧
    └── 00001.png ~ 00037.png    (37 张)        画廊图片
```

---

## 🎨 设计语言

### PC端（Lasse Pedersen 风格）

**布局**：
- 横向滚动（鼠标滚轮 → 横向 translateX）
- 首屏：视频背景（m1.mp4）+ 文字动画
- 画廊：3个视频 + 37张图片，横向排列
- 导航栏：透明 → 2.5秒后淡入

**区块**：
- 关于（about-pc）
- 服务（capability-pc）
- 案例（cases-pc）
- 效果（results-pc）
- 联系（contact-pc）

**视频播放**：
- hero视频：自动播放（autoplay）
- 画廊视频1：自动播放（autoplay）
- 画廊视频2、3：IntersectionObserver 控制（滚动到视口内播放）

### 移动端（SIR 风格）

**布局**：
- 竖向滚动
- 首屏：关于 + 3个视频（m1-mobile.mp4, m2-mobile.mp4, m3-mobile.mp4）
- 画廊：37张图片瀑布流
- 导航栏：白底固定顶部

**视频播放**：
- XMLHttpRequest 主动下载视频（不依赖 video 事件）
- 4重保险隐藏 loader
- poster 首帧显示（下载期间不白底）

---

## 🔧 技术栈

| 组件 | 技术 |
|------|------|
| **前端** | HTML 5 + CSS 3 + 原生 JavaScript（无框架）|
| **视频播放** | HTML5 Video API + IntersectionObserver |
| **响应式** | CSS Media Query（768px 断点）|
| **设备检测** | `window.innerWidth <= 768` |
| **HTTP服务** | Python 3.10 http.server / npx serve |
| **CDN** | Cloudflare Pages |
| **域名** | fashion.vfocus.com.cn（vfocus.com.cn 子域名）|

---

## 🎬 视频播放技术细节

### PC端视频播放实现

**hero视频**：
```javascript
// 自动播放
<video autoplay muted loop playsinline>
  <source src="images/m1.mp4" type="video/mp4">
</video>
```

**画廊视频1**：
```javascript
// autoplay 属性
video.autoplay = true;
video.src = `images/m1.mp4`;
```

**画廊视频2、3**：
```javascript
// IntersectionObserver 控制
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      video.play();
    } else {
      video.pause();
      video.currentTime = 0.1;
    }
  });
}, { threshold: 0.3 });
observer.observe(video);
```

### 移动端视频播放实现

**XMLHttpRequest 主动下载**：
```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', videoUrl, true);
xhr.responseType = 'blob';

xhr.onprogress = (e) => {
  if (e.lengthComputable) {
    const percent = (e.loaded / e.total * 100).toFixed(1);
    console.log(`下载进度: ${percent}%`);
  }
};

xhr.onload = () => {
  const blob = xhr.response;
  video.src = URL.createObjectURL(blob);
  video.play().catch(err => {
    console.log('自动播放被阻止，显示播放按钮');
    showPlayButton(video);
  });
  hideLoader();
};

xhr.send();
```

**4重保险隐藏 loader**：
1. XHR 下载完成 → 隐藏
2. video loadeddata 事件 → 隐藏
3. readyState 轮询 → 隐藏
4. setTimeout 3秒后 → 强制隐藏

### 微信X5内核视频播放规则

| 规则 | 说明 | 实现方式 |
|------|------|---------|
| **需要 source 标签** | 不能只设置 video.src | `<source src="..." type="video/mp4">` |
| **需要用户交互** | 自动播放被阻止 | 显示播放按钮 |
| **preload 不生效** | `preload='auto'` 无效 | XMLHttpRequest 主动下载 |
| **需要 Range 请求** | 流式播放需要 HTTP Range | Python Range-aware server |
| **需要 x5-* 属性** | 提高兼容性 | `x5-video-player-type="h5"` |
| **事件时机问题** | 事件可能在监听器前触发 | XHR 主动下载 |

---

## 🔍 导航映射实现

### PC端导航映射

```javascript
// HTML导航链接：#about, #capability, #cases, #results, #contact
// 实际HTML ID：about-pc, capability-pc, cases-pc, results-pc, contact-pc

let actualId = targetId;
if (targetId === 'about') actualId = 'about-pc';
if (targetId === 'capability') actualId = 'capability-pc';
if (targetId === 'cases') actualId = 'cases-pc';
if (targetId === 'results') actualId = 'results-pc';
if (targetId === 'contact') actualId = 'contact-pc';

const targetElement = document.getElementById(actualId);
targetScrollPosition = targetElement.offsetLeft - 100;
updateScrollPosition();
```

### 移动端导航映射

```javascript
// HTML导航链接：#about, #capability, #cases, #results, #contact
// 实际HTML ID：about, capability, cases, results, contact（不需要映射）

const targetElement = document.getElementById(targetId);
targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
```

---

## 📝 V7 Final 修复清单（2026-06-12）

### PC端修复

| BugFix | 问题 | 解决方案 |
|--------|------|---------|
| V7-008 | hero视频不自动播放 | 回滚到V5版本main.v2.js |
| V7-023 | PC端视频需要解锁 | `videoPlayUnlocked = !isMobile` |
| V7-024 | 视频只设置data-src | 改为直接设置 `video.src` |
| V7-025 | 视频1不播放 | 视频1设置 `autoplay`，视频2、3用 IntersectionObserver |
| V7-026 | 导航映射缺失 | 添加 capability/cases/results 映射 |
| V7-027 | "效果"跳转错误 | `results → results-pc` |

### 移动端修复

| BugFix | 问题 | 解决方案 |
|--------|------|---------|
| V7-011 | 视频连圈圈都没了 | 恢复 `loadMobileImages` 函数 |
| V7-014 | loader一直转不消失 | XMLHttpRequest主动下载 + 4重保险 |
| V7-016 | 下载后不自动播放 | 下载完成后尝试 `video.play()` |
| V7-017 | 视频下载时白底 | FFmpeg提取首帧作为poster |
| V7-018 | 视频与关于我们间距 | `padding-top: 5px` |
| V7-028 | 导航映射错误 | 移动端不需要ID映射，直接用原始ID |

### 其他修复

| BugFix | 问题 | 解决方案 |
|--------|------|---------|
| V7-019 | PC端首屏不隐藏 | JS强制3.5秒后隐藏 |
| V7-020 | isWeChat函数缺失 | 添加 `isWeChat` 函数 |
| V7-021 | 图片404错误 | 重命名图片填补空缺（43→37张）|
| V7-022 | hero视频poster错误 | 提取m1.mp4首帧 → m1-poster.jpg |

---

## 🚀 启动方式

### 正式版（HTTP 8080，线上）

```powershell
# 方法 1：直接启 HTTP（需要 cloudflared 已在跑）
M:\虾导的艺术\网站\start-website.ps1

# 方法 2：完整启动（HTTP + Tunnel）
M:\虾导的艺术\网站\start-complete.ps1
```

### 测试版（HTTP 8081/8082，本地预览）

```powershell
# PC端测试（8081，普通HTTP server）
cd M:\虾导的艺术\网站\测试版本
py -3.10 -m http.server 8081

# 移动端测试（8082，Range-aware HTTP server）
py -3.10 C:\Users\letou\.openclaw\workspace\temp\range_http_server.py 8082
```

### Cloudflare Tunnel（域名访问）

```powershell
cloudflared tunnel run my-tunnel
# 访问 https://fashion.vfocus.com.cn
```

---

## 📦 Git 提交信息

### V7 Final（2026-06-12 22:40）

```
commit 5641d12
V7 Final: 微信X5视频播放修复 + 导航映射修复

PC端修复：
- hero视频自动播放（V7-008, V7-022）
- 视频1 autoplay + 视频2、3 IntersectionObserver（V7-023~V7-025）
- 导航映射修复（V7-026, V7-027）

移动端修复：
- XMLHttpRequest主动下载视频（V7-014）
- poster首帧显示（V7-017）
- 视频自动播放尝试（V7-016）
- 导航映射修复（V7-028）

其他修复：
- isWeChat函数缺失（V7-020）
- 图片重命名填补空缺（V7-021）
- 移动端视频间距调整（V7-018）

新增文件：
- m1-poster.jpg, m1-mobile-poster.jpg
- m2-mobile-poster.jpg, m3-mobile-poster.jpg
- m1-mobile.mp4, m2-mobile.mp4, m3-mobile.mp4
```

---

## 📊 代码架构

### main.v2.js 核心函数

```javascript
// 设备检测
function isMobile() {
  return window.innerWidth <= 768;
}

// 微信检测
function isWeChat() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

// PC端初始化
function initPCVersion() {
  loadPCImages();           // 加载PC端图片和视频
  initHeroVideo();          // hero视频自动播放
  initNavigation();         // 导航绑定
  initScrollSync();         // 滚动同步
  initProgressBar();        // 进度条
}

// 移动端初始化
function initMobileVersion() {
  loadMobileImages();       // 加载移动端图片和视频
  initMobileGallery();      // 图片画廊
  initNavigation();         // 导航绑定
}

// 视频懒播放（PC端画廊视频2、3）
function initVideoLazyPlay(container) {
  const videos = container.querySelectorAll('video');
  videos.forEach(video => {
    const observer = new IntersectionObserver(...);
    observer.observe(video);
  });
}

// 移动端视频下载
function downloadAndPlayVideo(video, videoUrl, loader) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', videoUrl, true);
  xhr.responseType = 'blob';
  // ... 4重保险隐藏loader
}
```

---

## 📚 相关文档

| 文档 | 位置 | 说明 |
|------|------|------|
| **项目总览** | `M:\虾导的艺术\README.md` | 项目整体说明 |
| **接手文档** | `M:\虾导的艺术\网站\网站代码\HANDOVER.md` | 接手者必读 |
| **网站文案** | `M:\虾导的艺术\网站\网站文案-中文版.md` | 文案内容 |
| **今日日志** | `memory/2026-06-12.md` | 开发日志 |

---

## 🤝 接手者必读

1. **项目文件夹** = `M:\虾导的艺术`（可读可写）
2. **工作流**：改测试版 → 火鸡验收 → 同步正式版 → 推送GitHub
3. **不要擅自修改正式版**（等火鸡说"更新正式版"）
4. **不要擅自推送GitHub**（等火鸡说"推送"）
5. **必须遵守 HANDOVER.md 注释规范**（文件头 + JSDoc + 关键变量 + BugFix 注释）
6. **改移动端代码时，必须同时测试PC端**（移动端代码可能影响PC端）

---

## 🐛 已知问题

| 问题 | 状态 | 说明 |
|------|:----:|------|
| GitHub仓库未创建 | ⏳ | 需要火鸡创建 `birdonfire3/xiadao-website` |
| 微信X5视频播放 | ✅ | 已修复，需用户点击播放按钮 |

---

## 📊 版本历史

| 版本 | 日期 | 主要内容 | Git Commit |
|------|------|---------|:----------:|
| **V7 Final** | 2026-06-12 | 微信X5视频播放修复 + 导航映射修复 | 5641d12 |
| V2.1 | 2026-06-10 | PC端横向滚动 + 移动端竖向滚动适配 | - |
| V2.0 | 2026-06-09 | 响应式设计 + 43张真实图片 | - |
| V1.0 | 2026-06-08 | 初始版本（瀑布流布局）| - |

---

**最后更新**：2026-06-12 23:20（V7 Final）  
**创建时间**：2026-06-08 18:10（启元分身 v1）  
**维护者**：启元（AI）/ 火鸡（最终决策）
