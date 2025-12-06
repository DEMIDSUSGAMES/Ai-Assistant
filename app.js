// ==================== ГЛАВНОЕ ПРИЛОЖЕНИЕ ====================
const App = {
    config: {
        userId: '',
        userName: '',
        userAvatarColor: '#2196f3',
        colors: [
            '#2196f3', '#4caf50', '#ff9800', '#e91e63', 
            '#9c27b0', '#00bcd4', '#8bc34a', '#ff5722',
            '#3f51b5', '#009688', '#795548', '#607d8b'
        ],
        settings: {
            soundEnabled: true,
            animationsEnabled: true,
            notificationsEnabled: true
        }
    },
    
    // Инициализация приложения
    init() {
        console.log('🚀 AI Assistant запускается...');
        
        // Инициализация модулей
        AIDatabase.init();
        AIBrain.init();
        
        // Загрузка сохранённых данных
        this.loadSavedData();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        // Запуск фоновых процессов
        this.startBackgroundTasks();
        
        console.log('✅ AI Assistant готов к работе!');
    },
    
    // Загрузка сохранённых данных
    loadSavedData() {
        // Загрузка ID пользователя
        const savedUserId = localStorage.getItem('ai_user_id');
        const savedUserName = localStorage.getItem('ai_user_name');
        const savedColor = localStorage.getItem('ai_user_color');
        const savedSettings = localStorage.getItem('ai_settings');
        
        if (savedUserId && savedUserName) {
            this.config.userId = savedUserId;
            this.config.userName = savedUserName;
            this.showScreen('main-menu');
            
            // Обновление приветствия
            document.getElementById('user-greeting').textContent = `Привет, ${savedUserName}!`;
            
            // Регистрация в базе
            AIDatabase.registerUser(savedUserId, savedUserName);
        } else {
            this.showScreen('welcome-screen');
        }
        
        if (savedColor) {
            this.config.userAvatarColor = savedColor;
            this.updateAvatarColor(savedColor);
        }
        
        if (savedSettings) {
            this.config.settings = JSON.parse(savedSettings);
            this.applySettings();
        }
        
        // Инициализация цветовой палитры
        this.initColorPicker();
    },
    
    // Сохранение данных
    saveData() {
        localStorage.setItem('ai_user_id', this.config.userId);
        localStorage.setItem('ai_user_name', this.config.userName);
        localStorage.setItem('ai_user_color', this.config.userAvatarColor);
        localStorage.setItem('ai_settings', JSON.stringify(this.config.settings));
    },
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопка старта
        document.getElementById('start-btn').addEventListener('click', () => this.completeWelcome());
        
        // Поле ввода имени (Enter)
        document.getElementById('welcome-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.completeWelcome();
        });
        
        // Кнопки главного меню
        document.getElementById('chat-btn').addEventListener('click', () => {
            this.showScreen('chat-container');
            Chat.openChat();
        });
        
        document.getElementById('profile-btn').addEventListener('click', () => {
            this.showScreen('settings-menu');
            this.updateSettings();
        });
        
        document.getElementById('games-btn').addEventListener('click', () => {
            this.showScreen('games-menu');
        });
        
        document.getElementById('about-btn').addEventListener('click', () => {
            Notifications.show('AI Assistant v1.0.0<br>Создано с ❤️ для GitHub', 'info');
        });
        
        // Кнопки назад
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showScreen('main-menu');
        });
        
        document.getElementById('back-from-settings').addEventListener('click', () => {
            this.showScreen('main-menu');
        });
        
        document.getElementById('back-from-games').addEventListener('click', () => {
            this.showScreen('main-menu');
        });
        
        document.getElementById('back-from-admin').addEventListener('click', () => {
            this.showScreen('main-menu');
        });
        
        // Меню ИИ
        document.getElementById('ai-menu-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('ai-menu').classList.toggle('active');
        });
        
        // Закрытие меню ИИ при клике вне
        document.addEventListener('click', (e) => {
            const aiMenu = document.getElementById('ai-menu');
            const menuBtn = document.getElementById('ai-menu-btn');
            
            if (aiMenu.classList.contains('active') && 
                !aiMenu.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                aiMenu.classList.remove('active');
            }
        });
        
        // Кнопки меню ИИ
        document.getElementById('clear-chat-btn').addEventListener('click', () => {
            Chat.clearChat();
            document.getElementById('ai-menu').classList.remove('active');
        });
        
        document.getElementById('memory-btn').addEventListener('click', () => {
            Chat.showMemory();
            document.getElementById('ai-menu').classList.remove('active');
        });
        
        document.getElementById('teach-btn').addEventListener('click', () => {
            Chat.teachAI();
            document.getElementById('ai-menu').classList.remove('active');
        });
        
        document.getElementById('games-menu-btn').addEventListener('click', () => {
            this.showScreen('games-menu');
            document.getElementById('ai-menu').classList.remove('active');
        });
        
        // Кнопки игр
        document.getElementById('tic-tac-toe-game').addEventListener('click', () => {
            MiniGames.openGame('tic-tac-toe');
        });
        
        document.getElementById('math-game').addEventListener('click', () => {
            MiniGames.openGame('math');
        });
        
        document.getElementById('memory-game').addEventListener('click', () => {
            MiniGames.openGame('memory');
        });
        
        document.getElementById('quiz-game').addEventListener('click', () => {
            MiniGames.openGame('quiz');
        });
        
        // Настройки
        document.getElementById('save-name-btn').addEventListener('click', () => {
            this.updateUserName();
        });
        
        document.getElementById('name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.updateUserName();
        });
        
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.config.settings.soundEnabled = e.target.checked;
            this.saveData();
        });
        
        document.getElementById('animations-toggle').addEventListener('change', (e) => {
            this.config.settings.animationsEnabled = e.target.checked;
            this.saveData();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Вы уверены? Это удалит все ваши данные и историю чата.')) {
                this.resetApp();
            }
        });
        
        // Чат
        document.getElementById('send-btn').addEventListener('click', () => {
            Chat.sendMessage();
        });
        
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') Chat.sendMessage();
        });
    },
    
    // Завершение приветственного экрана
    completeWelcome() {
        const nameInput = document.getElementById('welcome-name');
        const name = nameInput.value.trim();
        
        if (name.length < 2) {
            Notifications.show('Введи своё имя (минимум 2 буквы)', 'error');
            return;
        }
        
        if (name.length > 20) {
            Notifications.show('Имя слишком длинное (максимум 20 букв)', 'error');
            return;
        }
        
        // Генерация уникального ID
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        this.config.userId = userId;
        this.config.userName = name;
        
        // Сохранение
        this.saveData();
        
        // Регистрация в базе
        AIDatabase.registerUser(userId, name);
        
        // Показать уведомление
        Notifications.show(`Приятно познакомиться, ${name}!`, 'success');
        
        // Переход в главное меню
        this.showScreen('main-menu');
        document.getElementById('user-greeting').textContent = `Привет, ${name}!`;
        
        // Воспроизвести звук
        this.playSound('notification');
    },
    
    // Обновление имени пользователя
    updateUserName() {
        const input = document.getElementById('name-input');
        const newName = input.value.trim();
        
        if (newName.length < 2) {
            Notifications.show('Имя должно быть минимум 2 символа', 'error');
            return;
        }
        
        if (newName.length > 20) {
            Notifications.show('Имя слишком длинное', 'error');
            return;
        }
        
        // Обновление
        this.config.userName = newName;
        this.saveData();
        
        // Обновление в базе
        AIDatabase.registerUser(this.config.userId, newName);
        
        // Обновление интерфейса
        document.getElementById('user-name-display').textContent = `Имя: ${newName}`;
        document.getElementById('user-greeting').textContent = `Привет, ${newName}!`;
        
        Notifications.show('Имя успешно изменено!', 'success');
        this.playSound('notification');
        
        // Обновление статистики
        this.updateSettings();
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
        
        // Скрыть оверлей игр
        document.getElementById('game-overlay').classList.remove('active');
        
        // Прокрутка вверх
        window.scrollTo(0, 0);
    },
    
    // Инициализация цветовой палитры
    initColorPicker() {
        const picker = document.getElementById('color-picker');
        if (!picker) return;
        
        picker.innerHTML = '';
        
        this.config.colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = `color-option ${color === this.config.userAvatarColor ? 'selected' : ''}`;
            colorOption.style.background = color;
            colorOption.dataset.color = color;
            
            colorOption.addEventListener('click', () => {
                this.changeAvatarColor(color);
            });
            
            picker.appendChild(colorOption);
        });
    },
    
    // Изменение цвета аватара
    changeAvatarColor(color) {
        this.config.userAvatarColor = color;
        this.saveData();
        
        this.updateAvatarColor(color);
        this.initColorPicker(); // Обновить выбор цвета
        
        Notifications.show('Цвет аватара изменён!', 'success');
        this.playSound('notification');
    },
    
    // Обновление цвета аватара
    updateAvatarColor(color) {
        const avatar = document.getElementById('avatar-preview');
        if (avatar) {
            avatar.style.setProperty('--user-avatar-color', 
                `linear-gradient(135deg, ${color}, ${this.lightenColor(color, 30)})`);
        }
        
        // Обновить аватары в чате
        document.querySelectorAll('.user-message .message-avatar').forEach(avatar => {
            avatar.style.background = `linear-gradient(135deg, ${color}, ${this.lightenColor(color, 30)})`;
        });
    },
    
    // Осветление цвета
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
    
    // Обновление настроек
    updateSettings() {
        // Обновить имя в поле ввода
        const nameInput = document.getElementById('name-input');
        if (nameInput) {
            nameInput.value = this.config.userName;
            document.getElementById('user-name-display').textContent = `Имя: ${this.config.userName}`;
        }
        
        // Обновить переключатели
        const soundToggle = document.getElementById('sound-toggle');
        const animToggle = document.getElementById('animations-toggle');
        
        if (soundToggle) soundToggle.checked = this.config.settings.soundEnabled;
        if (animToggle) animToggle.checked = this.config.settings.animationsEnabled;
        
        // Обновить статистику
        this.updateUserStats();
    },
    
    // Обновление статистики пользователя
    updateUserStats() {
        const statsElement = document.getElementById('user-stats');
        if (!statsElement) return;
        
        const stats = AIBrain.getUserStats(this.config.userId);
        if (stats) {
            statsElement.innerHTML = `
                <div style="text-align: left; line-height: 1.8;">
                    <strong>👤 Имя:</strong> ${stats.name}<br>
                    <strong>💬 Сообщений:</strong> ${stats.messageCount}<br>
                    <strong>📊 Диалогов:</strong> ${stats.conversationCount}<br>
                    <strong>🧠 Фактов о тебе:</strong> ${stats.factsCount}<br>
                    <strong>📅 Зарегистрирован:</strong> ${new Date(stats.created).toLocaleDateString()}<br>
                    <strong>🕒 Последний вход:</strong> ${new Date(stats.lastSeen).toLocaleString()}
                </div>
            `;
        }
    },
    
    // Применение настроек
    applySettings() {
        // Применить настройки звука
        const soundElements = document.querySelectorAll('audio');
        soundElements.forEach(audio => {
            audio.muted = !this.config.settings.soundEnabled;
        });
        
        // Применить настройки анимаций
        document.body.classList.toggle('no-animations', !this.config.settings.animationsEnabled);
    },
    
    // Воспроизведение звука
    playSound(type) {
        if (!this.config.settings.soundEnabled) return;
        
        const audio = document.getElementById(`${type}-sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    },
    
    // Сброс приложения
    resetApp() {
        // Очистка localStorage
        localStorage.clear();
        
        // Сброс конфигурации
        this.config.userId = '';
        this.config.userName = '';
        this.config.userAvatarColor = '#2196f3';
        this.config.settings = {
            soundEnabled: true,
            animationsEnabled: true,
            notificationsEnabled: true
        };
        
        // Сброс базы данных
        AIDatabase.reset();
        
        // Показать приветственный экран
        this.showScreen('welcome-screen');
        document.getElementById('welcome-name').value = '';
        
        Notifications.show('Все данные сброшены!', 'info');
    },
    
    // Запуск фоновых задач
    startBackgroundTasks() {
        // Периодические подсказки
        setInterval(() => {
            if (this.config.userName && Math.random() < 0.005) {
                const tips = [
                    `Привет, ${this.config.userName}! Не забывай, я всегда здесь!`,
                    "Попробуй мини-игры в меню!",
                    "Я запоминаю всё, чему меня учат!",
                    "Спроси меня о других пользователях!",
                    "Используй /admin для админ-панели"
                ];
                Notifications.show(tips[Math.floor(Math.random() * tips.length)]);
            }
        }, 60000);
        
        // Автосохранение каждые 30 секунд
        setInterval(() => {
            this.saveData();
            AIDatabase.save();
        }, 30000);
        
        // Проверка обновлений (раз в день)
        setInterval(() => {
            const lastUpdateCheck = localStorage.getItem('last_update_check');
            const today = new Date().toDateString();
            
            if (lastUpdateCheck !== today) {
                localStorage.setItem('last_update_check', today);
                console.log('📅 Проверка обновлений...');
            }
        }, 86400000); // 24 часа
    },
    
    // Админские функции
    showAdminPanel(password) {
        if (AIDatabase.checkAdmin(password)) {
            this.showScreen('admin-panel');
            this.loadAdminData();
            return true;
        }
        return false;
    },
    
    loadAdminData() {
        const stats = AIDatabase.getStats();
        const statsElement = document.getElementById('admin-stats');
        
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${stats.totalUsers}</div>
                    <div class="stat-label">Пользователей</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalMessages}</div>
                    <div class="stat-label">Сообщений</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalConversations}</div>
                    <div class="stat-label">Диалогов</div>
                </div>
            `;
        }
        
        this.loadUserList();
    },
    
    loadUserList() {
        const users = AIDatabase.getAllUsers();
        const userList = document.getElementById('user-list');
        const searchInput = document.getElementById('user-search');
        
        if (!userList) return;
        
        const renderUsers = (userArray) => {
            userList.innerHTML = '';
            
            userArray.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.innerHTML = `
                    <div>
                        <strong>${user.name}</strong><br>
                        <small>Сообщений: ${user.messageCount}</small>
                    </div>
                    <div class="user-actions">
                        <button class="user-action-btn view-btn" data-user="${user.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="user-action-btn clear-btn" data-user="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                userList.appendChild(userItem);
            });
            
            // Добавить обработчики для новых кнопок
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userId = e.target.closest('.view-btn').dataset.user;
                    this.viewUserConversation(userId);
                });
            });
            
            document.querySelectorAll('.clear-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userId = e.target.closest('.clear-btn').dataset.user;
                    this.clearUserChat(userId);
                });
            });
        };
        
        renderUsers(users);
        
        // Поиск пользователей
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredUsers = users.filter(user => 
                    user.name.toLowerCase().includes(searchTerm)
                );
                renderUsers(filteredUsers);
            });
        }
    },
    
    viewUserConversation(userId) {
        const conversation = AIDatabase.getUserConversation(userId);
        const user = AIDatabase.getUser(userId);
        const view = document.getElementById('conversation-view');
        
        if (!view) return;
        
        let html = `<h4>Диалог с ${user?.name || 'Неизвестный'}</h4>`;
        
        if (conversation.length === 0) {
            html += '<p>Нет сообщений</p>';
        } else {
            conversation.slice(-50).forEach(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString();
                html += `
                    <div class="conversation-message">
                        <strong>${msg.isAI ? '🤖 AI' : '👤 ' + (user?.name || 'Пользователь')}</strong> 
                        <small>(${time})</small>:<br>
                        ${msg.message}
                    </div>
                `;
            });
        }
        
        view.innerHTML = html;
        view.style.display = 'block';
        view.scrollTop = view.scrollHeight;
    },
    
    clearUserChat(userId) {
        if (confirm('Очистить диалог этого пользователя?')) {
            AIDatabase.clearUserChat(userId);
            Notifications.show('Диалог очищен', 'success');
            this.loadUserList();
        }
    }
};

// ==================== УВЕДОМЛЕНИЯ ====================
const Notifications = {
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? '✅' : 
                    type === 'error' ? '❌' : 
                    type === 'warning' ? '⚠️' : '🤖';
        
        notification.innerHTML = `
            <div style="font-size: 24px;">${icon}</div>
            <div style="flex: 1;">${message}</div>
            <div class="close-btn" style="cursor: pointer; font-size: 20px;">×</div>
        `;
        
        container.appendChild(notification);
        
        // Кнопка закрытия
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });
        
        // Автоматическое удаление
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
        
        // Воспроизвести звук
        App.playSound('notification');
    }
};

// ==================== ЗАПУСК ПРИЛОЖЕНИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});