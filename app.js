// Главное приложение
const App = {
    userId: '',
    userName: '',
    userColor: '#2196f3',
    isTeaching: false,

    // Инициализация
    init() {
        console.log('🚀 AI Assistant запускается...');
        
        // Загрузить настройки
        this.loadSettings();
        
        // Настроить обработчики событий
        this.setupEventListeners();
        
        console.log('✅ AI Assistant готов!');
    },

    // Загрузить настройки
    loadSettings() {
        const savedId = localStorage.getItem('user_id');
        const savedName = localStorage.getItem('user_name');
        const savedColor = localStorage.getItem('user_color');
        
        if (savedId && savedName) {
            this.userId = savedId;
            this.userName = savedName;
            this.userColor = savedColor || '#2196f3';
            
            // Показать главное меню
            showScreen('main-menu');
            document.getElementById('greeting').textContent = `Привет, ${savedName}!`;
            document.getElementById('display-name').textContent = savedName;
            
            // Обновить аватар
            this.updateAvatarColor(this.userColor);
            
            // Сохранить в память ИИ
            AI.registerUser(savedId, savedName, this.userColor);
        } else {
            // Показать приветственный экран
            showScreen('welcome-screen');
        }
    },

    // Сохранить настройки
    saveSettings() {
        localStorage.setItem('user_id', this.userId);
        localStorage.setItem('user_name', this.userName);
        localStorage.setItem('user_color', this.userColor);
    },

    // Настроить обработчики событий
    setupEventListeners() {
        // Поле ввода имени
        document.getElementById('user-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') startApp();
        });
        
        // Поле нового имени
        document.getElementById('new-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') changeName();
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('ai-menu');
            const avatar = document.querySelector('.ai-avatar');
            
            if (menu.classList.contains('active') && 
                !menu.contains(e.target) && 
                !avatar.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    },

    // Обновить цвет аватара
    updateAvatarColor(color) {
        const avatar = document.getElementById('user-avatar');
        avatar.style.background = `linear-gradient(135deg, ${color}, ${this.lightenColor(color, 30)})`;
    },

    // Осветлить цвет
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
};

// Глобальные функции
function startApp() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    
    if (name.length < 2) {
        showNotification('Введи имя (минимум 2 буквы)', 'error');
        return;
    }
    
    // Создать ID пользователя
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Сохранить настройки
    App.userId = userId;
    App.userName = name;
    App.saveSettings();
    
    // Сохранить в память ИИ
    AI.registerUser(userId, name, App.userColor);
    
    // Показать уведомление
    showNotification(`Привет, ${name}! Рад познакомиться!`, 'success');
    
    // Перейти в главное меню
    showScreen('main-menu');
    document.getElementById('greeting').textContent = `Привет, ${name}!`;
    document.getElementById('display-name').textContent = name;
}

function openChat() {
    Chat.open();
}

function openSettings() {
    showScreen('settings-screen');
    updateStats();
}

function goToMenu() {
    showScreen('main-menu');
}

function toggleAIMenu() {
    document.getElementById('ai-menu').classList.toggle('active');
}

function sendMessage() {
    Chat.send();
}

function clearChat() {
    Chat.clear();
}

function showMemory() {
    Chat.showMemory();
}

function teachAI() {
    Chat.teach();
}

function changeName() {
    const input = document.getElementById('new-name');
    const newName = input.value.trim();
    
    if (newName.length < 2) {
        showNotification('Имя должно быть минимум 2 символа', 'error');
        return;
    }
    
    // Обновить имя
    App.userName = newName;
    App.saveSettings();
    
    // Обновить в памяти ИИ
    AI.registerUser(App.userId, newName, App.userColor);
    
    // Обновить интерфейс
    document.getElementById('greeting').textContent = `Привет, ${newName}!`;
    document.getElementById('display-name').textContent = newName;
    input.value = '';
    
    showNotification('Имя изменено!', 'success');
    updateStats();
}

function changeColor(color) {
    App.userColor = color;
    App.saveSettings();
    
    // Обновить аватар
    App.updateAvatarColor(color);
    
    // Обновить в памяти ИИ
    AI.registerUser(App.userId, App.userName, color);
    
    showNotification('Цвет изменён!', 'success');
}

function updateStats() {
    const stats = AI.getUserStats(App.userId);
    const statsElement = document.getElementById('stats');
    
    statsElement.innerHTML = `
        <strong>👤 Имя:</strong> ${stats.name}<br>
        <strong>💬 Сообщений:</strong> ${stats.messages}<br>
        <strong>🧠 Выучено фактов:</strong> ${stats.facts}<br>
        <strong>👥 Всего пользователей:</strong> ${stats.totalUsers}<br>
        <strong>📅 Зарегистрирован:</strong> ${new Date(stats.created).toLocaleDateString()}<br>
        <strong>🕒 Последний раз:</strong> ${new Date(stats.lastSeen).toLocaleString()}
    `;
}

function showAdminPanel() {
    const users = AI.getAllUsers();
    let adminHTML = '<h3>👥 Все пользователи</h3>';
    
    if (users.length === 0) {
        adminHTML += '<p>Пользователей нет</p>';
    } else {
        users.forEach(user => {
            const conversation = AI.getConversation(user.id);
            adminHTML += `
                <div style="background:rgba(255,255,255,0.1); padding:10px; margin:5px 0; border-radius:8px;">
                    <strong>${user.name}</strong><br>
                    <small>Сообщений: ${conversation.length}</small>
                </div>
            `;
        });
    }
    
    addMessage(adminHTML, 'ai');
}

function showScreen(screenId) {
    // Скрыть все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показать нужный экран
    document.getElementById(screenId).classList.add('active');
    
    // Скрыть меню ИИ
    document.getElementById('ai-menu').classList.remove('active');
    
    // Прокрутка вверх
    window.scrollTo(0, 0);
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="font-size:20px;">
            ${type === 'success' ? '✅' : type === 'error' ? '❌' : '🤖'}
        </div>
        <div>${message}</div>
    `;
    
    container.appendChild(notification);
    
    // Удалить через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    
    // Автосохранение каждые 30 секунд
    setInterval(() => {
        App.saveSettings();
        AI.save();
    }, 30000);
    
    // Случайные подсказки
    setInterval(() => {
        if (App.userName && Math.random() < 0.005) {
            const tips = [
                `Привет, ${App.userName}! Я всегда здесь!`,
                'Попробуй спросить: "Кто такой Демид?"',
                'Используй /admin admin123 для админ-панели',
                'Я запоминаю всё, чему меня учат!'
            ];
            showNotification(tips[Math.floor(Math.random() * tips.length)]);
        }
    }, 60000);
});