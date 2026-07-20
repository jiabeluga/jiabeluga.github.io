    // 初始化背景音乐
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.3; // 30% 音量
    
    // 尝试自动播放背景音乐
    bgMusic.play().catch(() => {
        // 如果自动播放失败，等待用户交互后再播放
        document.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play();
            }
        }, { once: true });
    });

    // 打字机效果
    const phrases = ['Every day is a new day', '每一天都是新的一天'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typewriterElement = document.getElementById('typewriter');

    function type() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 150;

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    // 标题切换
    const originalTitle = 'JiaBeluga\'s /etc/.profile';
    const leaveTitle = '╭(°A°)╮ 你要去哪里？';
    const returnTitle = '(ฅ>ω<*ฅ) 诶嘿嘿，你回来啦！';
    let hasLeft = false;

    document.querySelectorAll('.external-link').forEach(link => {
        link.addEventListener('click', () => {
            document.title = leaveTitle;
            hasLeft = true;
        });
    });

    window.addEventListener('focus', () => {
        if (hasLeft) {
            document.title = returnTitle;
            setTimeout(() => {
                document.title = originalTitle;
                hasLeft = false;
            }, 3000);
        }
    });

    // 弹窗控制
    function showEmail() {
        const overlay = document.getElementById('emailModal');
        const modal = overlay.querySelector('.modal');
        overlay.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }

    function hideEmail() {
        const overlay = document.getElementById('emailModal');
        const modal = overlay.querySelector('.modal');
        modal.classList.remove('active');
        setTimeout(() => overlay.style.display = 'none', 300);
    }

    // 彩屑效果
    document.addEventListener('click', (e) => {
        if (e.target.closest('.icon-btn') || e.target.closest('.modal')) return;
        
        const colors = ['#FF34FF', '#39c5bb', '#C5E3EE', '#FFD700', '#FF4500'];
        for (let i = 0; i < 12; i++) {
            createConfetti(e.clientX, e.clientY, colors[Math.floor(Math.random() * colors.length)]);
        }
    });

    function createConfetti(x, y, color) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = color;
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        document.body.appendChild(confetti);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        let posX = x;
        let posY = y;
        let opacity = 1;

        function update() {
            posX += vx;
            posY += vy;
            opacity -= 0.02;
            confetti.style.left = posX + 'px';
            confetti.style.top = posY + 'px';
            confetti.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(update);
            } else {
                confetti.remove();
            }
        }
        requestAnimationFrame(update);
    }

    window.onload = type;