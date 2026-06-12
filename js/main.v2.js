/*
 * 虾导的艺术 - JavaScript文件
 * PC端：横向滚动（Lasse Pedersen风格）
 * 移动端：竖向滚动（SIR风格）
 */

// 图片总数
const TOTAL_IMAGES = 31;  // BugFix-V7-029 (2026-06-12 23:12): 从37张减少到31张，去掉倒数6张（下载太多太卡）

// 设备检测（安全获取）
const isMobile = (function() {
    try {
        const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
        return width <= 768;
    } catch (e) {
        return false; // 默认为PC端
    }
})();

// 微信浏览器检测
function isWeChat() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('micromessenger') !== -1 || ua.indexOf('wxwork') !== -1;
}

// DOM 元素
let galleryTrack = null;
let mobileGallery = null;
let progressBar = null;

// 滚动相关变量（PC端）
let scrollPosition = 0;
let maxScroll = 0;
let scrollSpeed = 0;
let targetScrollPosition = 0;
let currentScrollPosition = 0;
let isScrolling = false;
let scrollTimeout = null;
let animationId = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('虾导的艺术 - 网站已加载');

        // 安全获取屏幕宽度
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        console.log(`屏幕宽度: ${screenWidth}px`);

        // 设备检测（重新计算）
        const isMobileDevice = screenWidth <= 768;
        console.log(`设备类型: ${isMobileDevice ? '移动端' : 'PC端'}`);

        // 检查关键元素是否存在
        const heroSection = document.getElementById('heroSection');
        const gallerySection = document.getElementById('gallerySection');
        const mobileGallerySection = document.getElementById('mobileGallerySection');

        console.log(`heroSection 存在: ${!!heroSection}`);
        console.log(`gallerySection 存在: ${!!gallerySection}`);
        console.log(`mobileGallerySection 存在: ${!!mobileGallerySection}`);

        // BugFix-V5-004 (2026-06-11 00:48): 启动 hero 视频循环播放
        initHeroVideo();

        if (isMobileDevice) {
            initMobileVersion();
        } else {
            initPCVersion();
        }

        initNavigation();
    } catch (error) {
        console.error('❌ 初始化失败:', error);
        console.error('错误堆栈:', error.stack);
    }
});

// ==================== PC端版本 ====================

function initPCVersion() {
    console.log('=== 初始化PC端版本（横向滚动）===');

    const heroSection = document.getElementById('heroSection');
    const gallerySection = document.getElementById('gallerySection');
    const mobileGallerySection = document.getElementById('mobileGallerySection');
    const aboutMobileSection = document.getElementById('about-mobile');
    const contactMobileSection = document.querySelector('.contact-section-mobile');

    if (heroSection) {
        heroSection.style.display = 'flex';
        console.log('✅ heroSection 显示');
    }

    if (gallerySection) {
        gallerySection.style.display = 'block';
        console.log('✅ gallerySection 显示');
    }

    // PC端隐藏移动端专属区块
    if (mobileGallerySection) {
        mobileGallerySection.style.display = 'none';
    }
    if (aboutMobileSection) {
        aboutMobileSection.style.display = 'none';
    }
    if (contactMobileSection) {
        contactMobileSection.style.display = 'none';
    }

    galleryTrack = document.getElementById('galleryTrack');

    if (galleryTrack) {
        console.log('✅ galleryTrack 找到');
    } else {
        console.error('❌ galleryTrack 不存在');
        return;
    }

    loadPCImages();

    // 首屏淡出由 CSS 动画 fadeOutHero 完成（2s + 1s = 3s 后 z-index=-1）
    // BugFix-V7-019 (2026-06-12 19:05): JS 保险机制，即使 CSS 动画失败也强制隐藏
    setTimeout(() => {
        if (heroSection) {
            heroSection.style.pointerEvents = 'none';
            heroSection.style.opacity = '0';
            heroSection.style.visibility = 'hidden';
            heroSection.style.zIndex = '-1';
            console.log('✅ 首屏强制隐藏（JS 保险）');
        }
        // 动画结束后重新计算 maxScroll
        calculateMaxScroll();
    }, 3500);

    initHorizontalScroll();
    createProgressBar();
}

function loadPCImages() {
    if (!galleryTrack) {
        console.error('❌ galleryTrack 元素未找到');
        return;
    }

    console.log('开始加载PC端图片（一次性加载）...');

    // BugFix-004 (2026-06-10 23:42) - 修复 PC 端内容区块消失问题
    // 原代码使用 galleryTrack.innerHTML = '' 会清空 .content-sections 内的 5 个内容区块
    // （about-pc / capability / cases / results / contact-pc），导致导航锚点 #about #capability
    // #cases #contact 全部失效，"关于/服务/案例/联系"区块直接消失
    // 修复方案：保留 .content-sections，使用 insertBefore 将 43 张图片插入到 .content-sections 之前
    // 这样图片在左、内容区块在右，符合横向滚动设计

    // 查找 .content-sections（保留它，不清空）
    const contentSections = galleryTrack.querySelector('.content-sections');

    // 创建图片容器
    const imagesContainer = document.createElement('div');
    imagesContainer.className = 'images-container';
    imagesContainer.style.display = 'flex';
    imagesContainer.style.gap = '20px';
    imagesContainer.style.flexShrink = '0';

    // BugFix-V5-001 (2026-06-11 00:48): PC 端画廊头 3 个用视频（m1, m2, m3）
    // BugFix-V7-025 (2026-06-12 20:12): 视频1 autoplay，视频2、3 用 IntersectionObserver
    const pcVideoFiles = ['m1.mp4', 'm2.mp4', 'm3.mp4'];
    const pcVideos = [];  // 存储视频元素
    
    pcVideoFiles.forEach((videoFile, index) => {
        const videoItem = document.createElement('div');
        videoItem.className = 'gallery-item';

        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = `images/${videoFile}`;
        video.className = 'gallery-image pc-gallery-video';
        
        // 视频1设置 autoplay
        if (index === 0) {
            video.autoplay = true;
        }

        videoItem.appendChild(video);
        imagesContainer.appendChild(videoItem);
        pcVideos.push(video);
    });

    // 一次性加载所有图片
    for (let i = 1; i <= TOTAL_IMAGES; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = i;

        const img = document.createElement('img');
        const imgNum = String(i).padStart(5, '0');
        
        // BugFix-V7-030 (2026-06-12 23:58): 支持JPEG和PNG双重格式
        // 先尝试.jpg（压缩后的图片），如果不存在再尝试.png
        img.src = `images/${imgNum}.jpg`;
        img.alt = `Work ${i}`;
        img.loading = 'lazy';
        img.dataset.loaded = 'true';

        img.onerror = function() {
            // 如果.jpg失败，尝试.png
            if (this.src.endsWith('.jpg')) {
                this.src = `images/${imgNum}.png`;
            } else {
                // 如果.png也失败，隐藏图片
                this.style.display = 'none';
                console.warn(`图片加载失败: ${this.src}`);
            }
        };

        item.addEventListener('click', function() {
            openLightbox(img.src);
        });

        item.appendChild(img);
        imagesContainer.appendChild(item);
    }

    // 将图片容器插入到 .content-sections 之前（不破坏 .content-sections）
    if (contentSections && contentSections.parentNode === galleryTrack) {
        galleryTrack.insertBefore(imagesContainer, contentSections);
        console.log('✅ 图片已插入到 .content-sections 之前');
    } else {
        // 兜底：appendChild
        galleryTrack.appendChild(imagesContainer);
        console.warn('⚠️ 未找到 .content-sections，使用 appendChild');
    }

    console.log(`已创建 ${TOTAL_IMAGES} 个图片容器，content-sections 已保留`);

    // BugFix-V7-025 (2026-06-12 20:20): 视频2、3 用 IntersectionObserver（视频1 已有 autoplay）
    // 创建临时容器，只包含视频2、3（跳过视频1）
    const videosForLazyPlay = pcVideos.slice(1);  // 跳过第一个视频
    videosForLazyPlay.forEach(video => {
        // 触发 IntersectionObserver 检查
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(err => console.log('video play failed:', err));
                } else {
                    video.pause();
                    try { video.currentTime = 0.1; } catch (e) {}
                }
            });
        }, { threshold: 0.3 });
        observer.observe(video);
    });
    console.log('✅ 视频2、3 已设置 IntersectionObserver');

    setTimeout(() => {
        calculateMaxScroll();
    }, 500);
}

function calculateMaxScroll() {
    if (!galleryTrack) return;
    
    const trackWidth = galleryTrack.scrollWidth;
    const viewportWidth = window.innerWidth;
    maxScroll = trackWidth - viewportWidth + 80;
    
    console.log(`最大滚动距离: ${maxScroll}px`);
}

function initHorizontalScroll() {
    console.log('=== 初始化横向滚动事件 ===');

    window.addEventListener('wheel', function(e) {
        const heroSection = document.getElementById('heroSection');

        // 检查首屏状态 - 必须拦截滚动，否则 body 会上下跳动
        if (heroSection) {
            const display = heroSection.style.display;
            const opacity = getComputedStyle(heroSection).opacity;
            const isVisible = display !== 'none' && parseFloat(opacity) > 0.1;

            if (isVisible) {
                // 首屏还在显示，阻止默认滚动让首屏动画完整
                e.preventDefault();
                return;
            }
        }

        e.preventDefault();
        isScrolling = true;

        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => item.classList.add('scrolling'));

        const delta = e.deltaY || e.deltaX;
        scrollSpeed = delta * 1.5;

        targetScrollPosition += scrollSpeed;
        targetScrollPosition = Math.max(0, Math.min(targetScrollPosition, maxScroll));

        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            items.forEach(item => item.classList.remove('scrolling'));
        }, 150);

        if (!animationId) {
            animateScroll();
        }
    }, { passive: false });

    // 触摸板横向滚动支持
    window.addEventListener('wheel', function(e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0) {
            // 已经在主 wheel 处理中处理
        }
    }, { passive: true });

    window.addEventListener('resize', function() {
        // 重新检测设备
        const newIsMobile = (window.innerWidth || document.documentElement.clientWidth) <= 768;
        if (newIsMobile !== isMobile) {
            // 设备类型改变，建议刷新
            console.warn('设备类型已改变，请刷新页面');
        }
        if (!isMobile) {
            calculateMaxScroll();
            targetScrollPosition = Math.min(targetScrollPosition, maxScroll);
            currentScrollPosition = targetScrollPosition;
            updateScrollPosition();
        }
    });

    console.log('✅ 横向滚动事件已绑定');
}

function animateScroll() {
    const ease = 0.12;
    const diff = targetScrollPosition - currentScrollPosition;

    if (Math.abs(diff) < 0.5) {
        currentScrollPosition = targetScrollPosition;
    } else {
        currentScrollPosition += diff * ease;
    }

    updateScrollPosition();
    updateProgressBar();

    if (Math.abs(diff) > 0.5) {
        animationId = requestAnimationFrame(animateScroll);
    } else {
        animationId = null;
    }
}

function updateScrollPosition() {
    if (!galleryTrack) return;
    galleryTrack.style.transform = `translateX(-${currentScrollPosition}px)`;
}

function createProgressBar() {
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);
}

function updateProgressBar() {
    if (!progressBar || maxScroll <= 0) return;
    const progress = (currentScrollPosition / maxScroll) * 100;
    progressBar.style.width = `${progress}%`;
}

// 动态加载更多图片（PC端）- 已废弃，PC 端采用一次性加载
// 原逻辑引用了从未定义的 window.pcImageLoader，保留函数以避免调用报错
function loadMoreImagesIfNeeded() {
    // 一次性加载模式无需动态加载
    return;
}

// ==================== 移动端版本 ====================

function initMobileVersion() {
    console.log('=== 初始化移动端版本（竖向滚动）===');

    const heroSection = document.getElementById('heroSection');
    const gallerySection = document.getElementById('gallerySection');
    const mobileGallerySection = document.getElementById('mobileGallerySection');
    const aboutPcBlock = document.getElementById('about-pc');
    const contactPcBlock = document.getElementById('contact-pc');
    const contentSections = document.querySelector('.content-sections');

    // 移动端：隐藏 PC 端专属区块（首屏、横滚画廊、横向内容块）
    if (heroSection) {
        heroSection.style.display = 'none';
    }

    if (gallerySection) {
        gallerySection.style.display = 'none';
    }

    if (aboutPcBlock) {
        aboutPcBlock.style.display = 'none';
    }

    if (contactPcBlock) {
        contactPcBlock.style.display = 'none';
    }

    if (contentSections) {
        // 隐藏横向滚动区块（PC端独占）
        contentSections.style.display = 'none';
    }

    if (mobileGallerySection) {
        mobileGallerySection.style.display = 'block';
        console.log('✅ mobileGallerySection 显示');
    }

    mobileGallery = document.getElementById('mobileGallery');

    if (mobileGallery) {
        console.log('✅ mobileGallery 找到');
    } else {
        console.error('❌ mobileGallery 不存在');
        return;
    }

    loadMobileImages();
}

function loadMobileImages() {
    if (!mobileGallery) {
        console.error('❌ mobileGallery 元素未找到');
        return;
    }

    console.log('开始加载移动端图片...');
    mobileGallery.innerHTML = '';

    // BugFix-V5-001: 移动端画廊头 3 个用视频
    // BugFix-V7-011 (2026-06-12 05:20): 恢复播放按钮（微信 X5 必须用户交互才能播放）
    const mobileVideoFiles = ['m1-mobile.mp4', 'm2-mobile.mp4', 'm3-mobile.mp4'];
    mobileVideoFiles.forEach((videoFile, index) => {
        const item = document.createElement('div');
        item.className = 'grid-item grid-item-video';

        // BugFix-V6-007: 添加视频加载动画
        const loader = document.createElement('div');
        loader.className = 'video-loader';
        loader.innerHTML = '<div class="spinner"></div><span>下载中...</span>';
        item.appendChild(loader);

        // BugFix-V7-011: 播放按钮（微信 X5 必须用户交互）
        const playBtn = document.createElement('div');
        playBtn.className = 'video-play-btn';
        playBtn.innerHTML = '▶';
        playBtn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;color:#fff;background:rgba(0,0,0,0.5);border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;';
        item.appendChild(playBtn);

        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('x5-video-player-type', 'h5');
        video.setAttribute('x5-video-player-fullscreen', 'true');
        video.setAttribute('x5-video-orientation', 'portraint');
        video.setAttribute('x5-playsinline', 'true');
        video.preload = 'auto';
        video.disablePictureInPicture = true;
        video.controlsList = 'nodownload noremoteplayback';
        video.className = 'mobile-gallery-video';
        
        // BugFix-V7-017 (2026-06-12 18:47): 设置 poster 显示视频首帧（避免下载时白底）
        const posterUrl = `images/${videoFile.replace('.mp4', '-poster.jpg')}`;
        video.setAttribute('poster', posterUrl);
        video.poster = posterUrl;

        // 然后设置 source
        const source = document.createElement('source');
        source.src = `images/${videoFile}`;
        source.type = 'video/mp4';
        video.appendChild(source);
        video.dataset.src = `images/${videoFile}`;

        // BugFix-V7-014 (2026-06-12 15:38): 完全不依赖 video 事件，用 XMLHttpRequest 主动下载
        // 原因：微信 X5 可能不触发 video 任何事件（loadeddata/canplay/readyState）
        // BugFix-V7-015 (2026-06-12 15:38): 强制 setTimeout 保险（3秒后无论如论都隐藏）
        // BugFix-V7-016 (2026-06-12 18:40): 下载完成后尝试自动播放（微信X5可能阻止）
        const videoUrl = `images/${videoFile}`;
        const startTime = Date.now();

        const hideLoader = function() {
            if (loader.style.display !== 'none') {
                console.log('✅ 隐藏 loader:', videoFile, '(耗时', (Date.now() - startTime) + 'ms)');
                loader.style.display = 'none';
            }
        };

        // 方案1：XMLHttpRequest 主动下载
        const xhr = new XMLHttpRequest();
        xhr.open('GET', videoUrl, true);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('✅ XHR 下载完成:', videoFile);
                hideLoader();
                // 创建 blob URL 并设置给 video
                const blob = new Blob([xhr.response], { type: 'video/mp4' });
                const blobUrl = URL.createObjectURL(blob);
                video.src = blobUrl;
                
                // BugFix-V7-016: 下载完成后尝试自动播放
                const playPromise = video.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(function() {
                        console.log('✅ 自动播放成功:', videoFile);
                        playBtn.style.display = 'none';  // 隐藏播放按钮
                    }).catch(function(err) {
                        console.log('⚠️ 自动播放被阻止，显示播放按钮:', videoFile, err.name);
                        playBtn.style.display = 'flex';  // 显示播放按钮
                    });
                }
            }
        };
        xhr.onerror = function() {
            console.warn('⚠️ XHR 下载失败:', videoFile);
            hideLoader();  // 下载失败也隐藏 loader
        };
        xhr.send();

        // 方案2：保留 video 事件（备份）
        video.addEventListener('loadeddata', hideLoader);
        video.addEventListener('canplay', hideLoader);
        video.addEventListener('loadedmetadata', hideLoader);

        // 方案3：轮询 readyState
        let checkCount = 0;
        const checkReady = setInterval(function() {
            checkCount++;
            if (video.readyState >= 1) {
                console.log('✅ 轮询检测到视频已加载:', videoFile);
                hideLoader();
                clearInterval(checkReady);
            } else if (checkCount > 60) {  // 最多检查 6 秒
                clearInterval(checkReady);
            }
        }, 100);

        // 方案4：强制 setTimeout 保险（3秒后无论如论都隐藏）
        setTimeout(hideLoader, 3000);

        // BugFix-V7-012 (2026-06-12 05:23): 显式调用 load() 触发视频下载（微信 X5 preload 不生效）
        video.load();

        // BugFix-V7-011: 点击播放按钮
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.then(() => {
                    playBtn.style.display = 'none';  // 播放成功后隐藏按钮
                }).catch(err => {
                    console.log('video play failed:', err);
                });
            }
        });
        
        // 视频暂停时显示播放按钮
        video.addEventListener('pause', function() {
            playBtn.style.display = 'flex';
        });

        item.appendChild(video);
        mobileGallery.appendChild(item);
    });

    // 创建所有图片容器
    for (let i = 1; i <= TOTAL_IMAGES; i++) {
        const item = document.createElement('div');
        item.className = 'grid-item';

        const img = document.createElement('img');
        const imgNum = String(i).padStart(5, '0');
        
        // BugFix-V7-030 (2026-06-12 23:58): 支持JPEG和PNG双重格式
        // 先尝试.jpg（压缩后的图片），如果不存在再尝试.png
        img.src = `images/${imgNum}.jpg`;
        img.alt = `Work ${i}`;
        img.dataset.index = i;
        img.dataset.loaded = 'true';
        img.loading = 'lazy';
        img.style.background = '#f0f0f0';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'cover';
        
        img.onerror = function() {
            // 如果.jpg失败，尝试.png
            if (this.src.endsWith('.jpg')) {
                this.src = `images/${imgNum}.png`;
            } else {
                // 如果.png也失败，隐藏图片
                this.style.display = 'none';
                console.warn(`移动端图片加载失败: ${this.src}`);
            }
        };

        img.onerror = function() {
            this.style.display = 'none';
            console.warn(`图片加载失败: ${this.src}`);
        };

        item.style.animationDelay = `${i * 0.03}s`;

        item.addEventListener('click', function() {
            openLightbox(img.src);
        });

        item.appendChild(img);
        mobileGallery.appendChild(item);
    }

    console.log(`已创建 ${TOTAL_IMAGES} 个图片容器`);

    initVideoLazyPlay(mobileGallery);
}

// ==================== 视频懒播放 ====================

// BugFix-V5-002 (2026-06-11 00:48): 视频滚动到当前才播放，离开停止定在首帧
// 使用 IntersectionObserver 监听视频可见性，节省带宽 + 避免一打开就播
// BugFix-V6-025 (2026-06-11 20:50): 微信浏览器自动播放限制
// BugFix-V6-026 (2026-06-12 00:22): 使用 WeixinJSBridgeReady 事件
// BugFix-V7-010 (2026-06-12 05:15): 恢复备份版本的 initVideoLazyPlay（修复 video.src 覆盖问题）
// BugFix-V7-023 (2026-06-12 20:00): PC 端默认解锁，移动端需要解锁
let videoPlayUnlocked = !isMobile;  // PC 端默认解锁，移动端需要用户交互

function unlockVideoPlay() {
    if (videoPlayUnlocked) return;
    videoPlayUnlocked = true;
    console.log('✅ 视频播放已解锁（用户交互触发）');
    
    // 解锁后，尝试播放所有可见的视频
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
        const rect = video.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible && video.paused) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(err => console.log('video play failed:', err));
            }
        }
    });
}

function initVideoLazyPlay(container) {
    if (!container) return;

    const videos = container.querySelectorAll('video');
    if (!videos || videos.length === 0) return;

    // 微信环境：优先用 WeixinJSBridgeReady 事件解锁
    if (isWeChat()) {
        console.log('📱 微信环境，等待 WeixinJSBridgeReady 解锁视频...');
        document.addEventListener('WeixinJSBridgeReady', function() {
            console.log('✅ WeixinJSBridgeReady 事件触发，解锁视频');
            unlockVideoPlay();
        }, false);
    }

    // BugFix-V6-025: 添加用户交互监听器（微信浏览器需要）
    document.addEventListener('touchstart', unlockVideoPlay, { once: true, passive: true });
    document.addEventListener('click', unlockVideoPlay, { once: true, passive: true });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // BugFix-V6-002: 当前播放时暂停其他视频
                videos.forEach(v => {
                    if (v !== video && !v.paused) {
                        v.pause();
                        try { v.currentTime = 0.1; } catch (e) {}
                    }
                });
                
                // BugFix-V6-025: 只有在用户交互解锁后才播放
                if (!videoPlayUnlocked) {
                    console.log('⏳ 视频播放未解锁，等待用户交互或 WeixinJSBridgeReady...');
                    return;
                }
                
                // BugFix-V7-003: 撤销播放按钮，回退到自动播放
                // BugFix-V6-021: 微信X5不能设置 video.src（会覆盖 source 标签）
                if (!video.src && video.dataset.src && video.querySelector('source') === null) {
                    video.src = video.dataset.src;
                }
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(err => console.log('video play failed:', err));
                }
            } else {
                // BugFix-V7-003: 离开视口，暂停并恢复首帧
                video.pause();
                try {
                    video.currentTime = 0.1;
                } catch (e) {}
            }
        });
    }, {
        threshold: 0.3
    });

    videos.forEach(video => observer.observe(video));
    console.log(`✅ 视频懒播放已初始化（${videos.length} 个视频）`);
}

// BugFix-V5-004 (2026-06-11 00:48): hero 视频循环播放（页面打开即自动播放）
function initHeroVideo() {
    const heroVideo = document.getElementById('heroBgVideo');
    if (heroVideo) {
        const playPromise = heroVideo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(err => console.log('hero video play failed:', err));
        }
        console.log('✅ hero 视频已启动');
    } else {
        console.warn('⚠️ heroBgVideo 元素未找到');
    }
}

// ==================== 通用功能 ====================

function initNavigation() {
    console.log('=== 初始化导航 ===');

    // 绑定所有导航链接的点击事件
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // 跳过"作品"链接（active，不跳转）
            if (!href || href === '#' || !href.startsWith('#')) {
                e.preventDefault();
                // 切换 active 状态
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                return;
            }

            e.preventDefault();
            const targetId = href.substring(1);

            if (!isMobile) {
                // PC端：横向滚动到目标位置
                // PC端的导航映射：about/capability/cases/results/contact → about-pc/capability-pc/cases-pc/results-pc/contact-pc
                let actualId = targetId;
                if (targetId === 'about') actualId = 'about-pc';
                if (targetId === 'capability') actualId = 'capability-pc';
                if (targetId === 'cases') actualId = 'cases-pc';
                if (targetId === 'results') actualId = 'results-pc';
                if (targetId === 'contact') actualId = 'contact-pc';

                const targetElement = document.getElementById(actualId);
                if (targetElement) {
                    const targetOffset = targetElement.offsetLeft;
                    targetScrollPosition = Math.max(0, targetOffset - 100);
                    currentScrollPosition = targetScrollPosition;
                    updateScrollPosition();
                    updateProgressBar();
                    console.log(`跳转到: ${actualId}, 位置: ${targetScrollPosition}px`);
                } else {
                    console.warn(`PC端未找到目标元素: ${actualId}`);
                }
            } else {
                // 移动端：纵向滚动到目标位置
                // BugFix-V7-028 (2026-06-12 20:40): 移动端 HTML ID 就是原始ID，不需要映射
                // HTML ID: about, capability, cases, results, contact
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    console.warn(`移动端未找到目标元素: ${targetId}`);
                }
            }

            // 切换 active 状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    console.log('✅ 导航已绑定');
}

function toggleContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.classList.toggle('active');
    }
}

function openLightbox(imageSrc) {
    // 如果已有 lightbox 打开，先关闭（避免重复创建）
    const existingOverlay = document.querySelector('.lightbox-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.98);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 300;
        cursor: pointer;
    `;

    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 30px;
        font-size: 40px;
        color: #000;
        background: none;
        border: none;
        cursor: pointer;
    `;

    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    // 关闭事件
    const closeLightbox = function(e) {
        if (e.type === 'click' && e.target !== overlay && e.target !== closeBtn) {
            return;
        }
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
    };

    // ESC 键关闭
    const escHandler = function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            closeLightbox(e);
        }
    };

    overlay.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', escHandler);
}

// 导出函数
window.openLightbox = openLightbox;
window.toggleContact = toggleContact;
