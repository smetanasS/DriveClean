// database.js - Система управления данными через localStorage

class Database {
    constructor() {
        this.USERS_KEY = 'driveclean_users';
        this.CURRENT_USER_KEY = 'driveclean_current_user';
        this.HISTORY_KEY_PREFIX = 'driveclean_history_';
        this.STATS_KEY_PREFIX = 'driveclean_stats_';
    }

    // === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ===

    // Получить всех пользователей
    getAllUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : [];
    }

    // Сохранить пользователей
    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Найти пользователя по email
    findUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email === email);
    }

    // Создать нового пользователя
    createUser(userData) {
        const users = this.getAllUsers();
        
        // Проверка на существующий email
        if (this.findUserByEmail(userData.email)) {
            throw new Error('Пользователь с таким email уже существует');
        }

        const newUser = {
            id: this.generateId(),
            fullName: userData.fullName,
            email: userData.email,
            password: this.hashPassword(userData.password), // В реальном приложении используйте bcrypt
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(newUser);
        this.saveUsers(users);

        // Инициализировать статистику пользователя
        this.initializeUserStats(newUser.id);

        return newUser;
    }

    // Авторизация пользователя
    loginUser(email, password) {
        const user = this.findUserByEmail(email);
        
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        if (user.password !== this.hashPassword(password)) {
            throw new Error('Неверный пароль');
        }

        // Обновить время последнего входа
        user.lastLogin = new Date().toISOString();
        this.updateUser(user);

        // Сохранить текущего пользователя
        this.setCurrentUser(user);

        return user;
    }

    // Обновить данные пользователя
    updateUser(updatedUser) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        
        if (index !== -1) {
            users[index] = updatedUser;
            this.saveUsers(users);
        }
    }

    // Установить текущего пользователя (сессия)
    setCurrentUser(user) {
        const safeUser = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(safeUser));
    }

    // Получить текущего пользователя
    getCurrentUser() {
        const user = localStorage.getItem(this.CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    // Выйти из системы
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    // Проверка авторизации
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    // === УПРАВЛЕНИЕ СТАТИСТИКОЙ ===

    // Инициализировать статистику пользователя
    initializeUserStats(userId) {
        const stats = {
            totalFiles: 0,
            totalSize: 0,
            todayFiles: 0,
            lastCleanDate: null
        };
        localStorage.setItem(this.STATS_KEY_PREFIX + userId, JSON.stringify(stats));
    }

    // Получить статистику пользователя
    getUserStats(userId) {
        const stats = localStorage.getItem(this.STATS_KEY_PREFIX + userId);
        return stats ? JSON.parse(stats) : this.initializeUserStats(userId);
    }

    // Обновить статистику после очистки файла
    updateStatsAfterCleaning(userId, fileSize) {
        const stats = this.getUserStats(userId);
        const today = new Date().toDateString();

        // Сброс счетчика "сегодня" если новый день
        if (stats.lastCleanDate !== today) {
            stats.todayFiles = 0;
        }

        stats.totalFiles += 1;
        stats.todayFiles += 1;
        stats.totalSize += fileSize;
        stats.lastCleanDate = today;

        localStorage.setItem(this.STATS_KEY_PREFIX + userId, JSON.stringify(stats));
        return stats;
    }

    // === УПРАВЛЕНИЕ ИСТОРИЕЙ ОЧИСТКИ ===

    // Получить историю пользователя
    getUserHistory(userId) {
        const history = localStorage.getItem(this.HISTORY_KEY_PREFIX + userId);
        return history ? JSON.parse(history) : [];
    }

    // Добавить запись в историю
    addToHistory(userId, fileData) {
        const history = this.getUserHistory(userId);
        
        const record = {
            id: this.generateId(),
            fileName: fileData.fileName,
            fileSize: fileData.fileSize,
            fileType: fileData.fileType,
            metadataRemoved: fileData.metadataRemoved || [],
            cleanedAt: new Date().toISOString()
        };

        history.unshift(record); // Добавить в начало

        // Ограничить историю 100 записями
        if (history.length > 100) {
            history.pop();
        }

        localStorage.setItem(this.HISTORY_KEY_PREFIX + userId, JSON.stringify(history));
        return record;
    }

    // Очистить историю пользователя
    clearUserHistory(userId) {
        localStorage.removeItem(this.HISTORY_KEY_PREFIX + userId);
    }

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

    // Генерация ID
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Простое хеширование (в реальном приложении используйте bcrypt или подобное)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(36);
    }

    // Форматирование размера файла
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    // Форматирование даты
    formatDate(isoDate) {
        const date = new Date(isoDate);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('ru-RU', options);
    }

    // Очистить все данные (для разработки)
    clearAllData() {
        localStorage.clear();
        console.log('Все данные очищены');
    }

    // Получить статистику по всем пользователям (для админки)
    getGlobalStats() {
        const users = this.getAllUsers();
        let totalUsers = users.length;
        let totalFilesGlobal = 0;
        let totalSizeGlobal = 0;

        users.forEach(user => {
            const stats = this.getUserStats(user.id);
            totalFilesGlobal += stats.totalFiles;
            totalSizeGlobal += stats.totalSize;
        });

        return {
            totalUsers,
            totalFilesGlobal,
            totalSizeGlobal: this.formatFileSize(totalSizeGlobal)
        };
    }
}

// Создать глобальный экземпляр базы данных
const db = new Database();

// Экспортировать для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Database;
}
