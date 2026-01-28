// auth.js - Обработка регистрации и входа

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Если пользователь уже авторизован, перенаправить на dashboard
    if (db.isAuthenticated() && !window.location.pathname.includes('dashboard.html')) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
    }
});

// === РЕГИСТРАЦИЯ ===
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Очистить предыдущие сообщения
        hideMessage('errorMessage');
        hideMessage('successMessage');

        // Валидация
        if (!validateRegistration(formData)) {
            return;
        }

        try {
            // Создать пользователя
            const newUser = db.createUser({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            });

            // Показать успех
            showMessage('successMessage', `Регистрация успешна! Добро пожаловать, ${newUser.fullName}!`);
            
            // Автоматический вход
            db.setCurrentUser(newUser);

            // Перенаправление через 2 секунды
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);

        } catch (error) {
            showMessage('errorMessage', error.message);
        }
    });
}

// Валидация формы регистрации
function validateRegistration(data) {
    if (data.fullName.length < 2) {
        showMessage('errorMessage', 'Имя должно содержать минимум 2 символа');
        return false;
    }

    if (!isValidEmail(data.email)) {
        showMessage('errorMessage', 'Введите корректный email адрес');
        return false;
    }

    if (data.password.length < 6) {
        showMessage('errorMessage', 'Пароль должен содержать минимум 6 символов');
        return false;
    }

    if (data.password !== data.confirmPassword) {
        showMessage('errorMessage', 'Пароли не совпадают');
        return false;
    }

    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        showMessage('errorMessage', 'Необходимо согласиться с условиями использования');
        return false;
    }

    return true;
}

// === ВХОД ===
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        // Очистить предыдущие сообщения
        hideMessage('loginError');
        hideMessage('loginSuccess');

        try {
            // Войти в систему
            const user = db.loginUser(email, password);

            // Показать успех
            showMessage('loginSuccess', `Добро пожаловать, ${user.fullName}!`);

            // Перенаправление
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            showMessage('loginError', error.message);
        }
    });
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// Обработка клика на "Забыли пароль"
const forgotLink = document.querySelector('.forgot-link');
if (forgotLink) {
    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Функция восстановления пароля будет доступна в следующей версии.\n\nДля демонстрации вы можете зарегистрировать новый аккаунт.');
    });
}

// Переключение видимости пароля (опционально)
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}
