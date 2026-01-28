// dashboard.js - Логика личного кабинета

// Защита страницы - только для авторизованных пользователей
document.addEventListener('DOMContentLoaded', function() {
    if (!db.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    initializeDashboard();
});

// Инициализация dashboard
function initializeDashboard() {
    const currentUser = db.getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Отобразить данные пользователя
    displayUserInfo(currentUser);
    
    // Отобразить статистику
    displayStats(currentUser.id);
    
    // Отобразить историю
    displayHistory(currentUser.id);
    
    // Настроить обработчики событий
    setupEventHandlers();
}

// Отобразить информацию о пользователе
function displayUserInfo(user) {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.fullName;
    }
}

// Отобразить статистику
function displayStats(userId) {
    const stats = db.getUserStats(userId);
    const user = db.getCurrentUser();

    document.getElementById('totalFiles').textContent = stats.totalFiles;
    document.getElementById('todayFiles').textContent = stats.todayFiles;
    document.getElementById('totalSize').textContent = db.formatFileSize(stats.totalSize);
    
    if (user.createdAt) {
        const date = new Date(user.createdAt);
        const formattedDate = date.toLocaleDateString('ru-RU', { 
            year: 'numeric', 
            month: 'short',
            day: 'numeric'
        });
        document.getElementById('memberSince').textContent = formattedDate;
    }
}

// Отобразить историю
function displayHistory(userId) {
    const history = db.getUserHistory(userId);
    const container = document.getElementById('historyContainer');

    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = '<p class="empty-state">История пуста. Очистите первый файл!</p>';
        return;
    }

    let html = '<div class="history-list">';
    
    history.forEach(record => {
        const date = new Date(record.cleanedAt);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        html += `
            <div class="history-item">
                <div class="history-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                </div>
                <div class="history-details">
                    <div class="history-filename">${record.fileName}</div>
                    <div class="history-meta">
                        <span>${db.formatFileSize(record.fileSize)}</span>
                        <span>•</span>
                        <span>${formattedDate}</span>
                    </div>
                    ${record.metadataRemoved && record.metadataRemoved.length > 0 ? 
                        `<div class="metadata-tags">
                            ${record.metadataRemoved.map(tag => `<span class="metadata-tag">${tag}</span>`).join('')}
                        </div>` : ''
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Настроить обработчики событий
function setupEventHandlers() {
    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Загрузка файлов
    const uploadZone = document.querySelector('.upload-zone-dashboard');
    const fileInput = document.getElementById('fileInputDashboard');
    const uploadLink = document.querySelector('.upload-link-dashboard');

    if (uploadLink && fileInput) {
        uploadLink.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
    }

    if (uploadZone) {
        uploadZone.addEventListener('dragover', handleDragOver);
        uploadZone.addEventListener('dragleave', handleDragLeave);
        uploadZone.addEventListener('drop', handleFileDrop);
    }

    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
}

// Обработка выхода
function handleLogout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        db.logout();
        window.location.href = 'index.html';
    }
}

// Обработка drag & drop
function handleDragOver(e) {
    e.preventDefault();
    this.style.borderColor = 'var(--green-btn)';
    this.style.backgroundColor = 'rgba(93, 200, 98, 0.1)';
}

function handleDragLeave() {
    this.style.borderColor = 'var(--border-dash)';
    this.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
}

function handleFileDrop(e) {
    e.preventDefault();
    this.style.borderColor = 'var(--border-dash)';
    this.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFiles(files);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFiles(files);
    }
}

// Обработка загруженных файлов
function processFiles(files) {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    let processedCount = 0;

    Array.from(files).forEach((file) => {
        // Симуляция очистки метаданных
        const metadataRemoved = [
            'GPS Location',
            'Camera Serial',
            'EXIF Data',
            'Edit History',
            'Creation Date'
        ];

        // Добавить в историю
        const record = db.addToHistory(currentUser.id, {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            metadataRemoved: metadataRemoved
        });

        // Обновить статистику
        db.updateStatsAfterCleaning(currentUser.id, file.size);

        processedCount++;
    });

    // Обновить интерфейс
    displayStats(currentUser.id);
    displayHistory(currentUser.id);

    // Показать уведомление
    showNotification(`Успешно очищено файлов: ${processedCount}`, 'success');

    // Сбросить input
    const fileInput = document.getElementById('fileInputDashboard');
    if (fileInput) fileInput.value = '';
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создать элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Добавить на страницу
    document.body.appendChild(notification);

    // Показать с анимацией
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Скрыть через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
