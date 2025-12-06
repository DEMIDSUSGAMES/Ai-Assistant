// Главное приложение
const App = {
    // Настройки
    config: {
        userId: '',
        userName: '',
        userColor: '#2196f3',
        isTeaching: false
    },
    
    // Инициализация
    init() {
        console.log('🚀 AI Assistant запускается...');
        
        // Инициализировать ИИ
        AIBrain.init();
        
        // Загрузить настройки
        this.loadSettings();
        
        // Настроить кнопки
        this.setupButtons();
        
        // Запустить фоновые задачи
        this.startBackgroundTasks();
        
        console.log('✅ AI Assistant готов!');
    },
    
    // Загрузить настройки
    loadSettings() {
        const savedId = localStorage.getItem('user_id');
        const savedName = localStorage.getItem('user_name');
        const savedColor = localStorage.getItem('user_color');
        
        if (savedId && savedName) {
            this.config.userId = savedId;
            this.config.userName = savedName;
            this.config.userColor = savedColor || '#2196f3';
            
            // Показать главное меню
            this.showScreen('main-menu');
            document.getElementById('greeting').textContent = `Привет, ${savedName}!`;
            document.getElementById('display-name').textContent = savedName;
            
            // Обновить аватар
            this.updateAvatarColor(this.config.userColor);
            
            // Сохранить в память ИИ
            AIBrain.saveUser(savedId, savedName, this.config.userColor);
        } else {
            // Показать приветственный экран
            this.showScreen('welcome-screen');
        }
    },
    
    // Сохранить настройки
    saveSettings() {
        localStorage.setItem('user_id', this.config.userId);
        localStorage.setItem('user_name', this.config.userName);
        localStorage.setItem('user_color', this.config.userColor);
    },
    
    // Настроить кнопки
    setupButtons() {
        // Поле ввода имени
        document.getElementById('user-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startApp();
        });
        
        // Поле нового имени
        document.getElementById('new-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.changeName();
        });
        
        // Поле сообщения
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
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
    
    // Показать экран
    showScreen(screenId) {
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
        
        // Обновление статистики в настройках
        if (screenId === 'settings-screen') {
            this.updateStats();
        }
        
        // Загрузка чата
        if (screenId === 'chat-screen') {
            this.loadChat();
        }
    },
    
    // Старт приложения
    startApp() {
        const nameInput = document.getElementById('user-name');
        const name = nameInput.value.trim();
        
        if (name.length < 2) {
            this.showNotification('Введи имя (минимум 2 буквы)', 'error');
            return;
        }
        
        if (name.length > 20) {
            this.showNotification('Имя слишком длинное', 'error');
            return;
        }
        
        // Создать ID пользователя
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Сохранить настройки
        this.config.userId = userId;
        this.config.userName = name;
        this.saveSettings();
        
        // Сохранить в память ИИ
        AIBrain.saveUser(userId, name, this.config.userColor);
        
        // Показать уведомление
        this.showNotification(`Привет, ${name}! Рад познакомиться!`, 'success');
        
        // Перейти в главное меню
        this.showScreen('main-menu');
        document.getElementById('greeting').textContent = `Привет, ${name}!`;
        document.getElementById('display-name').textContent = name;
    },
    
    // Открыть чат
    openChat() {
        this.showScreen('chat-screen');
        
        // Если чат пустой, показать приветствие
        const messages = document.getElementById('chat-messages');
        if (messages.children.length === 0) {
            const greeting = AIBrain.generateResponse('привет', this.config.userId, this.config.userName);
            this.addMessage(greeting, 'ai');
        }
    },
    
    // Открыть настройки
    openSettings() {
        this.showScreen('settings-screen');
    },
    
    // Вернуться в меню
    goToMenu() {
        this.showScreen('main-menu');
    },
    
    // Переключить меню ИИ
    toggleMenu() {
        document.getElementById('ai-menu').classList.toggle('active');
    },
    
    // Отправить сообщение
    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Проверка на админскую команду
        if (message.startsWith('/admin')) {
            const response = AIBrain.generateResponse(message, this.config.userId, this.config.userName);
            this.addMessage(response, 'ai');
            
            if (response.includes('админ-панели разрешён')) {
                setTimeout(() => {
                    this.showAdminPanel();
                }, 1000);
            }
            
            input.value = '';
            return;
        }
        
        // Режим обучения
        if (this.config.isTeaching) {
            const response = AIBrain.generateResponse(message, this.config.userId, this.config.userName);
            this.addMessage(response, 'ai');
            this.config.isTeaching = false;
            input.value = '';
            return;
        }
        
        // Добавить сообщение пользователя
        this.addMessage(message, 'user');
        input.value = '';
        
        // Показать индикатор набора
        document.getElementById('typing').style.display = 'block';
        
        // ИИ думает
        setTimeout(() => {
            document.getElementById('typing').style.display = 'none';
            
            const response = AIBrain.generateResponse(message, this.config.userId, this.config.userName);
            this.addMessage(response, 'ai');
            
            // Прокрутка вниз
            const messages = document.getElementById('chat-messages');
            messages.scrollTop = messages.scrollHeight;
        }, 800 + Math.random() * 700);
    },
    
    // Добавить сообщение в чат
    addMessage(text, sender) {
        const messages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        
        messages.appendChild(messageDiv);
        
        // Прокрутка вниз
        setTimeout(() => {
            messages.scrollTop = messages.scrollHeight;
        }, 100);
    },
    
    // Загрузить историю чата
    loadChat() {
        const messages = document.getElementById('chat-messages');
        messages.innerHTML = '';
        
        const conversation = AIBrain.memory.conversations[this.config.userId] || [];
        
        conversation.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.type}-message`;
            messageDiv.textContent = msg.message;
            messages.appendChild(messageDiv);
        });
        
        // Прокрутка вниз
        setTimeout(() => {
            messages.scrollTop = messages.scrollHeight;
        }, 100);
    },
    
    // Очистить чат
    clearChat() {
        if (confirm('Очистить историю чата?')) {
            AIBrain.clearUserChat(this.config.userId);
            document.getElementById('chat-messages').innerHTML = '';
            document.getElementById('ai-menu').classList.remove('active');
            
            const greeting = AIBrain.generateResponse('привет', this.config.userId, this.config.userName);
            this.addMessage(greeting, 'ai');
            
            this.showNotification('Чат очищен', 'success');
        }
    },
    
    // Показать память
    showMemory() {
        const memory = AIBrain.getUserMemory(this.config.userId);
        this.addMessage(memory, 'ai');
        document.getElementById('ai-menu').classList.remove('active');
    },
    
    // Научить ИИ
    teachAI() {
        this.addMessage('Отлично! Напиши что-нибудь, и я это запомню! Например: "Демид любит программирование"', 'ai');
        this.config.isTeaching = true;
        document.getElementById('ai-menu').classList.remove('active');
    },
    
    // Изменить имя
    changeName() {
        const input = document.getElementById('new-name');
        const newName = input.value.trim();
        
        if (newName.length < 2) {
            this.showNotification('Имя должно быть минимум 2 символа', 'error');
            return;
        }
        
        if (newName.length > 20) {
            this.showNotification('Имя слишком длинное', 'error');
            return;
        }
        
        // Обновить имя
        this.config.userName = newName;
        this.saveSettings();
        
        // Обновить в памяти ИИ
        AIBrain.saveUser(this.config.userId, newName, this.config.userColor);
        
        // Обновить интерфейс
        document.getElementById('greeting').textContent = `Привет, ${newName}!`;
        document.getElementById('display-name').textContent = newName;
        input.value = '';
        
        this.showNotification('Имя изменено!', 'success');
        this.updateStats();
    },
    
    // Изменить цвет
    changeColor(color) {
        this.config.userColor = color;
        this.saveSettings();
        
        // Обновить аватар
        this.updateAvatarColor(color);
        
        // Обновить в памяти ИИ
        AIBrain.saveUser(this.config.userId, this.config.userName, color);
        
        this.showNotification('Цвет изменён!', 'success');
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
    },
    
    // Обновить статистику
    updateStats() {
        const stats = AIBrain.getStats(this.config.userId);
        const statsElement = document.getElementById('stats');
        
        statsElement.innerHTML = `
            <div style="line-height: 1.8;">
                <strong>👤 Имя:</strong> ${stats.name}<br>
                <strong>💬 Сообщений:</strong> ${stats.messages}<br>
                <strong>🧠 Выучено фактов:</strong> ${stats.facts}<br>
                <strong>👥 Всего пользователей:</strong> ${stats.totalUsers}<br>
                <strong>📅 Зарегистрирован:</strong> ${new Date(stats.created).toLocaleDateString()}<br>
                <strong>🕒 Последний вход:</strong> ${new Date(stats.lastSeen).toLocaleString()}
            </div>
        `;
    },
    
    // Показать админ-панель
    showAdminPanel() {
        const users = AIBrain.getAllUsers();
        let adminHTML = '<h3>👥 Все пользователи</h3>';
        
        if (users.length === 0) {
            adminHTML += '<p>Пользователей нет</p>';
        } else {
            users.forEach(user => {
                adminHTML += `
                    <div style="background:rgba(255,255,255,0.1); padding:10px; margin:5px 0; border-radius:8px;">
                        <strong>${user.name}</strong><br>
                        <small>Сообщений: ${AIBrain.memory.conversations[user.id]?.length || 0}</small>
                    </div>
                `;
            });
        }
        
        this.addMessage(adminHTML, 'ai');
    },
    
    // Сбросить данные
    resetData() {
        if (confirm('Точно сбросить ВСЕ данные? Это нельзя отменить!')) {
            localStorage.clear();
            location.reload();
        }
    },
    
    // Показать уведомление
    showNotification(message, type = 'info') {
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
    },
    
    // Показать информацию
    showAbout() {
        this.showNotification('AI Assistant v1.0<br>Умный ИИ с памятью', 'info');
    },
    
    // Запустить фоновые задачи
    startBackgroundTasks() {
        // Автосохранение
        setInterval(() => {
            this.saveSettings();
            AIBrain.save();
        }, 30000);
        
        // Случайные подсказки
        setInterval(() => {
            if (this.config.userName && Math.random() < 0.005) {
                const tips = [
                    `Привет, ${this.config.userName}! Я всегда здесь!`,
                    'Попробуй спросить: "Кто такой Демид?"',
                    'Используй /admin для админ-панели',
                    'Я запоминаю всё, чему меня учат!'
                ];
                this.showNotification(tips[Math.floor(Math.random() * tips.length)]);
            }
        }, 60000);
    }
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});