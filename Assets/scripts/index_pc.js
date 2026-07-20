// ========== 背景音乐 ==========
const bgMusic = document.getElementById('bgMusic');
bgMusic.volume = 0.3;
bgMusic.play().catch(() => {
    document.addEventListener('click', () => {
        if (bgMusic.paused) bgMusic.play();
    }, { once: true });
});

// ========== Banner 随机选择 ==========
(function() {
    const bannerImages = ['./img/pc_1.jpg', './img/pc_2.png', './img/pc_3.jpg'];
    document.getElementById('bannerImg').src = bannerImages[Math.floor(Math.random() * bannerImages.length)];
})();

// ========== 打字机效果 ==========
const phrases = ['Every day is a new day', '每一天都是新的一天'];
let phraseIndex = 0, charIndex = 0, isDeleting = false;
const typewriterEl = document.getElementById('typewriter');

function type() {
    const current = phrases[phraseIndex];
    typewriterEl.textContent = isDeleting
        ? current.substring(0, --charIndex)
        : current.substring(0, ++charIndex);

    let speed = isDeleting ? 50 : 150;
    if (!isDeleting && charIndex === current.length) { isDeleting = true; speed = 2000; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; speed = 500; }
    setTimeout(type, speed);
}

// ========== 标题切换 ==========
const originalTitle = "JiaBeluga's /etc/.profile";
let hasLeft = false;
document.querySelectorAll('.external-link').forEach(link => {
    link.addEventListener('click', () => { document.title = '╭(°A°)╮ 你要去哪里？'; hasLeft = true; });
});
window.addEventListener('focus', () => {
    if (hasLeft) {
        document.title = '(ฅ>ω<*ฅ) 诶嘿嘿，你回来啦！';
        setTimeout(() => { document.title = originalTitle; hasLeft = false; }, 3000);
    }
});

// ========== 弹窗控制 ==========
function showEmail() {
    const o = document.getElementById('emailModal');
    o.style.display = 'flex';
    setTimeout(() => o.querySelector('.modal').classList.add('active'), 10);
}
function hideEmail() {
    const o = document.getElementById('emailModal');
    o.querySelector('.modal').classList.remove('active');
    setTimeout(() => o.style.display = 'none', 300);
}

// ========== 彩屑效果 ==========
document.addEventListener('click', (e) => {
    if (e.target.closest('.icon-btn') || e.target.closest('.modal') || e.target.closest('.mirror-box') || e.target.closest('.sticky-note')) return;
    const colors = ['#FF34FF', '#39c5bb', '#C5E3EE', '#FFD700', '#FF4500'];
    for (let i = 0; i < 12; i++) createConfetti(e.clientX, e.clientY, colors[Math.floor(Math.random() * colors.length)]);
});

function createConfetti(x, y, color) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.cssText = `background:${color};left:${x}px;top:${y}px;`;
    document.body.appendChild(c);
    const angle = Math.random() * Math.PI * 2;
    const v = 2 + Math.random() * 5;
    let px = x, py = y, op = 1;
    const vx = Math.cos(angle) * v, vy = Math.sin(angle) * v;
    (function update() {
        px += vx; py += vy; op -= 0.02;
        c.style.left = px + 'px'; c.style.top = py + 'px'; c.style.opacity = op;
        op > 0 ? requestAnimationFrame(update) : c.remove();
    })();
}

// ========== 镜子盒子交互 ==========
let mirrorClicks = 0;
const mirrorTexts = ['这是镜子', 'huh?', '真的什么都没有哦'];
const mirrorBox = document.getElementById('mirrorBox');
const mirrorBoxText = document.getElementById('mirrorBoxText');

mirrorBox.addEventListener('click', () => {
    mirrorClicks++;

    // 当前文字渐出
    mirrorBoxText.classList.add('fade-out');

    if (mirrorClicks <= 2) {
        // 显示下一段文字
        setTimeout(() => {
            mirrorBoxText.textContent = mirrorTexts[mirrorClicks];
            mirrorBoxText.classList.remove('fade-out');
        }, 1000);
    } else if (mirrorClicks === 3) {
        // 第三次点击：最后的文字渐出后触发便利贴
        setTimeout(() => {
            mirrorBoxText.style.display = 'none';
            dropStickyNote();
        }, 1000);
    }
});

// ========== 便利贴降落 ==========
function dropStickyNote() {
    const string = document.getElementById('string');
    const note = document.getElementById('stickyNote');
    string.style.display = 'block';
    note.style.display = 'block';

    // 起始位置：屏幕右侧 35% 处
    const anchorX = window.innerWidth * 0.65;
    const targetY = window.innerHeight * 0.37;

    string.style.left = anchorX + 'px';
    string.style.top = '0px';
    string.style.height = '0px';

    note.style.left = (anchorX - 47) + 'px';
    note.style.top = '-120px';

    let currentNoteY = -120;
    const dropSpeed = 4;

    const dropAnim = setInterval(() => {
        currentNoteY += dropSpeed;
        note.style.top = currentNoteY + 'px';
        string.style.height = (currentNoteY + 120) + 'px';

        if (currentNoteY >= targetY) {
            clearInterval(dropAnim);
            note.style.top = targetY + 'px';
            string.style.height = (targetY + 120) + 'px';
            startSwing(anchorX, targetY);
            setupNoteDrag(anchorX, targetY);
        }
    }, 16);
}

// ========== 便利贴摆动 ==========
let swingRAF = null;
function startSwing(anchorX, noteY) {
    let angle = 0, dir = 1;
    const maxAngle = 3, speed = 0.06;
    const note = document.getElementById('stickyNote');
    const string = document.getElementById('string');

    function swing() {
        angle += dir * speed;
        if (Math.abs(angle) >= maxAngle) dir *= -1;

        const rad = angle * Math.PI / 180;
        const offsetX = Math.sin(rad) * 15;

        note.style.transform = `rotate(${angle}deg)`;
        note.style.left = (anchorX - 47 + offsetX) + 'px';
        string.style.transform = `rotate(${angle * 0.3}deg)`;

        swingRAF = requestAnimationFrame(swing);
    }
    swing();
}

function stopSwing() {
    if (swingRAF) { cancelAnimationFrame(swingRAF); swingRAF = null; }
}

// ========== 便利贴拖拽 & 点击 ==========
function setupNoteDrag(anchorX, noteY) {
    const note = document.getElementById('stickyNote');
    const string = document.getElementById('string');
    let isDragging = false, dragStartTime = 0, startY = 0;

    note.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartTime = Date.now();
        startY = e.clientY;
        stopSwing();
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dy = e.clientY - startY;
        const newY = noteY + dy;
        note.style.top = newY + 'px';
        string.style.height = (newY + 120) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        const elapsed = Date.now() - dragStartTime;
        if (elapsed >= 600) {
            triggerTransition();
        } else {
            // 恢复摆动
            note.style.top = noteY + 'px';
            string.style.height = (noteY + 120) + 'px';
            startSwing(anchorX, noteY);
        }
    });

    // 点击便利贴也触发
    note.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerTransition();
    });
}

// ========== 转场效果 ==========
function triggerTransition() {
    stopSwing();
    const note = document.getElementById('stickyNote');
    const string = document.getElementById('string');
    const mainPage = document.getElementById('mainPage');
    const curtainL = document.getElementById('curtainLeft');
    const curtainR = document.getElementById('curtainRight');

    // 播放 Gaster 音效
    const gasterAudio = new Audio('./Gaster.m4a');
    gasterAudio.play().catch(() => {});

    // 便利贴和绳子上升渐隐
    note.style.transition = 'top 0.8s ease-in, opacity 0.8s ease-in';
    string.style.transition = 'height 0.8s ease-in, opacity 0.8s ease-in';
    note.style.top = '-200px';
    note.style.opacity = '0';
    string.style.height = '0px';
    string.style.opacity = '0';

    // 主页面渐隐
    setTimeout(() => {
        mainPage.style.opacity = '0';
    }, 500);

    // 黑色幕布蔓延
    setTimeout(() => {
        curtainL.classList.add('close');
        curtainR.classList.add('close');
    }, 1200);

    // 幕布完全覆盖后：切换到镜子页面
    setTimeout(() => {
        mainPage.style.display = 'none';
        note.style.display = 'none';
        string.style.display = 'none';
        document.body.style.background = 'black';

        // 设置镜子页面背景
        const mirrorWallpapers = [
            './img/mirror_wallpaper_pc.jpg',
            './img/mirror_wallpaper_pc_1.jpg',
            './img/mirror_wallpaper_pc_2.jpg'
        ];
        const mirrorPage = document.getElementById('mirrorPage');
        mirrorPage.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${mirrorWallpapers[Math.floor(Math.random() * mirrorWallpapers.length)]}')`;
        mirrorPage.style.display = 'flex';

        // 加载一言
        loadHitokoto();

        // 幕布退散
        setTimeout(() => {
            curtainL.classList.remove('close');
            curtainR.classList.remove('close');
            // 镜子页面渐入
            setTimeout(() => {
                mirrorPage.classList.add('visible');
            }, 300);
        }, 500);
    }, 2700);
}

// ========== 一言 API ==========
function loadHitokoto() {
    fetch('https://v1.hitokoto.cn')
        .then(r => r.json())
        .then(data => {
            document.getElementById('hitokotoText').textContent = data.hitokoto;
            document.getElementById('hitokotoFrom').textContent = '— ' + (data.from || '未知');
        })
        .catch(() => {
            document.getElementById('hitokotoText').textContent = 'Every day is a new day';
            document.getElementById('hitokotoFrom').textContent = '— JiaBeluga';
        });
}

// ========== 初始化 ==========
window.onload = type;