/*
 * 虾导的艺术 - JavaScript文件
 * PC端：横向滚动（Lasse Pedersen风格）
 * 移动端：竖向滚动（SIR风格）
 */

// 图片总数
const TOTAL_IMAGES = 43;

// 设备检测（安全获取）
const isMobile = (function() {
    try {
        const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
        return width <= 768;
    } catch (e) {
        return false; // 默认为PC端
    }
})();

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
    // 不再额外设置 display:none，避免动画冲突
    setTimeout(() => {
        if (heroSection) {
            heroSection.style.pointerEvents = 'none';
            console.log('✅ 首屏动画完成');
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
    // 滚动到当前才播放，离开停止定在首帧（由 initVideoLazyPlay 控制）
    const pcVideoFiles = ['m1.mp4', 'm2.mp4', 'm3.mp4'];
    pcVideoFiles.forEach(videoFile => {
        const videoItem = document.createElement('div');
        videoItem.className = 'gallery-item';

        // BugFix-V6-007 (2026-06-11 03:35): 添加视频加载动画
        const loader = document.createElement('div');
        loader.className = 'video-loader';
        loader.innerHTML = '<div class="spinner"></div><span>下载中...</span>';
        videoItem.appendChild(loader);

        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.dataset.src = `images/${videoFile}`;  // 用 data-src 延迟加载
        video.className = 'gallery-image pc-gallery-video';

        // BugFix-V6-007: 视频加载完成后隐藏加载动画
        video.addEventListener('loadeddata', function() {
            loader.style.display = 'none';
        });
        video.addEventListener('canplay', function() {
            loader.style.display = 'none';
        });

        videoItem.appendChild(video);
        imagesContainer.appendChild(videoItem);
    });

    // 一次性加载所有图片
    for (let i = 1; i <= TOTAL_IMAGES; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = i;

        const img = document.createElement('img');
        img.src = `images/${String(i).padStart(5, '0')}.png`;
        img.alt = `Work ${i}`;
        img.loading = 'lazy';
        img.dataset.loaded = 'true'; // 一次性加载模式

        img.onerror = function() {
            this.style.display = 'none';
            console.warn(`图片加载失败: ${this.src}`);
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

    // BugFix-V5-001 (2026-06-11 00:48): 初始化视频懒播放（PC 端）
    initVideoLazyPlay(imagesContainer);

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

    // BugFix-V5-001 (2026-06-11 00:48): 移动端画廊头 3 个用视频（m1, m2, m3）
    // 滚动到当前才播放，离开停止定在首帧（由 initVideoLazyPlay 控制）
    const mobileVideoFiles = ['m1.mp4', 'm2.mp4', 'm3.mp4'];
    mobileVideoFiles.forEach(videoFile => {
        const item = document.createElement('div');
        item.className = 'grid-item grid-item-video';

        // BugFix-V6-007 (2026-06-11 03:35): 添加视频加载动画
        const loader = document.createElement('div');
        loader.className = 'video-loader';
        loader.innerHTML = '<div class="spinner"></div><span>下载中...</span>';
        item.appendChild(loader);

        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.dataset.src = `images/${videoFile}`;  // 用 data-src 延迟加载
        video.className = 'mobile-gallery-video';

        // BugFix-V6-007: 视频加载完成后隐藏加载动画
        video.addEventListener('loadeddata', function() {
            loader.style.display = 'none';
        });
        video.addEventListener('canplay', function() {
            loader.style.display = 'none';
        });

        item.appendChild(video);
        mobileGallery.appendChild(item);
    });

    // BugFix-005 (2026-06-10 23:42) - 修复移动端图片不显示问题
    // 原代码依赖 IntersectionObserver 在图片进入视口时才设置 img.src
    // 但 img 没有 src 时 width=0 / height=0，导致 .grid-item 高度为 0
    // .image-grid 使用 column-count: 2 瀑布流布局，grid-item 全为 0 时整个网格高度为 0
    // 进而 mobile-gallery-section 高度为 0，IntersectionObserver 永远不会触发
    // 形成"零高度死锁"，移动端完全看不到图片
    // 修复方案：直接设置 img.src（移除 IntersectionObserver），让浏览器原生 lazy loading 处理
    // 配合 img.loading="lazy" 已能满足性能需求

    // 创建所有图片容器
    for (let i = 1; i <= TOTAL_IMAGES; i++) {
        const item = document.createElement('div');
        item.className = 'grid-item';

        const img = document.createElement('img');
        // 关键修复：直接设置 src，让图片立即有真实尺寸
        img.src = `images/${String(i).padStart(5, '0')}.png`;
        img.alt = `Work ${i}`;
        img.dataset.index = i;
        img.dataset.loaded = 'true';
        img.loading = 'lazy';  // 浏览器原生懒加载
        img.style.background = '#f0f0f0';

        img.onerror = function() {
            this.style.display = 'none';
            console.warn(`图片加载失败: ${this.src}`);
        };

        // BugFix-V6-008 (2026-06-11 03:38): 移除比例判断，所有图片都以宽度为准
        // 火鸡要求：所有图以宽为准缩放，铺满宽度
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'cover';  // 填满容器，不留白

        item.style.animationDelay = `${i * 0.03}s`;

        item.addEventListener('click', function() {
            // BugFix-002 (2026-06-10 22:35) - 修复懒加载图片无法打开 lightbox 的问题
            openLightbox(img.src);
        });

        item.appendChild(img);
        mobileGallery.appendChild(item);
    }

    console.log(`已创建 ${TOTAL_IMAGES} 个图片容器`);

    // BugFix-V5-001 (2026-06-11 00:48): 初始化视频懒播放（移动端）
    initVideoLazyPlay(mobileGallery);
}

// ==================== 视频懒播放 ====================

// BugFix-V5-002 (2026-06-11 00:48): 视频滚动到当前才播放，离开停止定在首帧
// 使用 IntersectionObserver 监听视频可见性，节省带宽 + 避免一打开就播
function initVideoLazyPlay(container) {
    if (!container) return;

    const videos = container.querySelectorAll('video');
    if (!videos || videos.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // BugFix-V6-002 (2026-06-11 03:05): 当前播放时暂停其他视频
                videos.forEach(v => {
                    if (v !== video && !v.paused) {
                        v.pause();
                        try { v.currentTime = 0; } catch (e) {}
                    }
                });
                
                // 滚动到当前：首次加载 src + 播放
                if (!video.src && video.dataset.src) {
                    video.src = video.dataset.src;
                }
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(err => console.log('video play failed:', err));
                }
            } else {
                // 离开当前：暂停 + 定首帧
                video.pause();
                try {
                    video.currentTime = 0;
                } catch (e) {
                    // 部分浏览器在 metadata 未加载时设置 currentTime 会抛错，忽略即可
                }
            }
        });
    }, {
        threshold: 0.3  // BugFix-V6-015: 降低阈值，30%可见就播放
    });

    videos.forEach(video => observer.observe(video));
    console.log(`✅ 视频懒播放已初始化（${videos.length} 个视频，同一时间只播一个）`);
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
                // PC端的"关于"对应 about-pc，"联系"对应 contact-pc
                let actualId = targetId;
                if (targetId === 'about') actualId = 'about-pc';
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
                // BugFix-V6-015 (2026-06-11 04:55): 修复锚点ID映射
                // 移动端section ID已统一为：about / capability / cases / results / contact
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
