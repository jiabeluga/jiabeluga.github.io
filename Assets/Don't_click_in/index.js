// 检测系统深色模式偏好
function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const body = document.body;
    
    if (prefersDark) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        // 加载随机背景图片
        loadRandomBackground();
    }
}

function loadRandomBackground() {
    const randomNum = Math.floor(Math.random() * 5) + 1;
    const bgUrl = `https://raw.githubusercontent.com/jiabeluga/jiabeluga.github.io/main/Assets/Nya${String(randomNum).padStart(4, '0')}.jpg`;
    
    // 预加载图片
    const img = new Image();
    img.onload = () => {
        document.body.style.setProperty('--bg-image', `url('${bgUrl}')`);
        document.body.style.backgroundImage = `url('${bgUrl}')`;
        document.body.style.setProperty('background-image', `url('${bgUrl}')`, 'important');
        
        // 使用 ::before 伪元素的背景
        const style = document.createElement('style');
        style.textContent = `body.with-bg::before { background-image: url('${bgUrl}'); }`;
        document.head.appendChild(style);
        
        // 触发渐入动画
        setTimeout(() => {
            document.body.classList.add('with-bg');
        }, 50);
    };
    img.src = bgUrl;
}

// 获取文件列表
async function fetchItems() {
    try {
        const response = await fetch(
            'https://api.github.com/repos/jiabeluga/jiabeluga.github.io/contents/Assets/Don%27t_click_in',
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        // 筛选掉index.html，按名称排序
        const filtered = data
            .filter(item => item.name !== 'index.html')
            .sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'dir' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });

        return filtered;
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to fetch items');
    }
}

// 获取子项
async function fetchSubItems(path) {
    try {
        const encodedPath = path.split('/').map(p => encodeURIComponent(p)).join('/');
        const response = await fetch(
            `https://api.github.com/repos/jiabeluga/jiabeluga.github.io/contents/${encodedPath}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                },
            }
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        return data
            .filter(item => item.name !== 'index.html')
            .sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'dir' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
    } catch {
        return [];
    }
}

// 检查文件夹是否包含index.html
async function hasIndexHtml(path) {
    try {
        const encodedPath = path.split('/').map(p => encodeURIComponent(p)).join('/');
        const response = await fetch(
            `https://api.github.com/repos/jiabeluga/jiabeluga.github.io/contents/${encodedPath}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                },
            }
        );

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.some(item => item.name === 'index.html');
    } catch {
        return false;
    }
}

// 创建树形结构HTML
function createTreeHTML(items, parentPath = '', level = 0) {
    let html = '';

    items.forEach((item, index) => {
        const newPath = parentPath ? `${parentPath}/${item.name}` : item.name;
        const isLast = index === items.length - 1;
        const prefix = level > 0 ? (isLast ? '└' : '├') : '';
        const itemId = `item-${newPath.replace(/\//g, '-')}`;
        
        // 只有第一层的文件夹才可能展开
        const isExpandable = level === 0 && item.type === 'dir';

        html += `<div class="tree-item" id="${itemId}">`;
        html += `<button class="tree-button" data-path="${newPath}" data-type="${item.type}" data-level="${level}" data-expandable="${isExpandable}">`;
        
        if (item.type === 'dir') {
            html += `<span class="tree-prefix">${prefix}</span>`;
            if (isExpandable) {
                html += `<span class="icon"><svg class="folder-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg></span>`;
            } else {
                html += `<span class="icon" style="width: 1rem;"></span>`;
                html += `<svg class="folder-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 1rem; height: 1rem;"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
            }
            html += `<span class="text">${item.name}</span>`;
        } else {
            html += `<span class="tree-prefix">${prefix}</span>`;
            html += `<span class="icon" style="width: 1rem;"></span>`;
            html += `<span class="text">${item.name}</span>`;
        }
        
        html += `</button>`;
        if (isExpandable) {
            html += `<div class="tree-children" id="children-${itemId}" style="display: none;"></div>`;
        }
        html += `</div>`;
    });

    return html;
}

// 处理树形结构交互
async function setupTreeInteraction() {
    const contentDiv = document.getElementById('content');
    const clickedItems = new Set();

    contentDiv.addEventListener('click', async (e) => {
        const button = e.target.closest('.tree-button');
        if (!button) return;

        const path = button.dataset.path;
        const type = button.dataset.type;
        const level = parseInt(button.dataset.level);
        const expandable = button.dataset.expandable === 'true';
        const itemId = `item-${path.replace(/\//g, '-')}`;
        const childrenDiv = document.getElementById(`children-${itemId}`);

        if (type === 'dir' && expandable) {
            // 第一层文件夹：检查是否有index.html
            const hasIndex = await hasIndexHtml(`Assets/Don't_click_in/${path}`);
            
            if (hasIndex) {
                // 有index.html，直接跳转
                const url = `https://jiabeluga.github.io/Assets/Don't_click_in/${path}`;
                window.location.href = url;
            } else {
                // 没有index.html，展开显示子文件夹
                const isExpanded = childrenDiv && childrenDiv.style.display !== 'none';
                
                if (isExpanded) {
                    childrenDiv.style.display = 'none';
                    const icon = button.querySelector('.icon');
                    if (icon) icon.classList.remove('rotated');
                } else {
                    if (childrenDiv && childrenDiv.innerHTML === '') {
                        // 首次加载子项
                        const subItems = await fetchSubItems(`Assets/Don't_click_in/${path}`);
                        childrenDiv.innerHTML = createTreeHTML(subItems, path, level + 1);
                        setupTreeInteraction();
                    }
                    if (childrenDiv) childrenDiv.style.display = 'block';
                    const icon = button.querySelector('.icon');
                    if (icon) icon.classList.add('rotated');
                }
            }
        } else if (type === 'dir') {
            // 非第一层文件夹直接跳转
            const url = `https://jiabeluga.github.io/Assets/Don't_click_in/${path}`;
            window.location.href = url;
        } else {
            // 文件点击直接跳转
            const url = `https://jiabeluga.github.io/Assets/Don't_click_in/${path}`;
            window.location.href = url;
        }
    });

    contentDiv.addEventListener('mousedown', (e) => {
        const button = e.target.closest('.tree-button');
        if (!button || button.dataset.type !== 'dir') return;

        const path = button.dataset.path;
        const expandable = button.dataset.expandable === 'true';
        
        if (!expandable) return;

        if (clickedItems.has(path)) {
            clickedItems.delete(path);
            button.classList.remove('clicked');
        } else {
            clickedItems.add(path);
            button.classList.add('clicked');
        }
    });
}

// 初始化
async function init() {
    initTheme();
    const contentDiv = document.getElementById('content');

    try {
        const items = await fetchItems();

        if (items.length === 0) {
            contentDiv.innerHTML = '<div class="empty">没有找到任何文件或文件夹</div>';
            return;
        }

        contentDiv.innerHTML = createTreeHTML(items);
        await setupTreeInteraction();
    } catch (err) {
        contentDiv.innerHTML = `
            <div class="error">
                <div class="error-title">错误: ${err.message}</div>
                <div class="error-message">无法加载文件列表。请确保仓库路径正确。</div>
            </div>
        `;
    }
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    location.reload();
});

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}