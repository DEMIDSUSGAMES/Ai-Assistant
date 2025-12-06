// ==================== БАЗА ДАННЫХ ====================
const AIDatabase = {
    // Конфигурация
    config: {
        version: '1.0.0',
        adminPassword: 'admin123',
        maxMessagesPerUser: 1000,
        maxUsers: 1000,
        backupInterval: 300000 // 5 минут
    },
    
    // Данные
    data: {
        users: {},           // Все пользователи
        conversations: {},   // Все диалоги
        learnedFacts: [],    // Выученные факты
        gameScores: {},      // Результаты игр
        settings: {},        // Глобальные настройки
        statistics: {        // Статистика
            totalUsers: 0,
            totalMessages: 0,
            totalConversations: 0,
            dailyActivity: {},
            peakHours: {}
        }
    },
    
    // Инициализация
    init() {
        console.log('📦 Инициализация базы данных...');
        
        // Загрузка сохранённых данных
        this.load();
        
        // Проверка целостности
        this.validateData();
        
        // Настройка автосохранения
        this.setupAutoSave();
        
        // Настройка резервного копирования
        this.setupBackup();
        
        console.log('✅ База данных готова');
    },
    
    // Загрузка данных
    load() {
        try {
            const saved = localStorage.getItem('ai_assistant_database');
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Миграция данных (если нужно)
                this.migrateData(parsed);
                
                // Обновление данных
                Object.assign(this.data, parsed);
                
                console.log(`📊 Загружено: ${this.data.totalUsers} пользователей, ${this.data.totalMessages} сообщений`);
            } else {
                console.log('🆕 Создана новая база данных');
                this.initializeDefaultData();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки базы:', error);
            this.initializeDefaultData();
        }
    },
    
    // Инициализация данных по умолчанию
    initializeDefaultData() {
        this.data = {
            users: {},
            conversations: {},
            learnedFacts: [],
            gameScores: {},
            settings: {
                autoSave: true,
                notifications: true,
                privacyMode: false
            },
            statistics: {
                totalUsers: 0,
                totalMessages: 0,
                totalConversations: 0,
                dailyActivity: {},
                peakHours: {}
            }
        };
        
        // Добавить тестовых пользователей (для демонстрации)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.addDemoData();
        }
    },
    
    // Добавление демо-данных
    addDemoData() {
        const demoUsers = [
            { id: 'demo_demid', name: 'Демид', color: '#2196f3' },
            { id: 'demo_nastya', name: 'Настя', color: '#e91e63' },
            { id: 'demo_dima', name: 'Дима', color: '#4caf50' },
            { id: 'demo_mika', name: 'Мика', color: '#ff9800' }
        ];
        
        demoUsers.forEach(user => {
            if (!this.data.users[user.id]) {
                this.registerUser(user.id, user.name, user.color);
                
                // Добавить демо-сообщения
                const demoMessages = [
                    { message: 'Привет! Как дела?', isAI: false },
                    { message: 'Привет! У меня всё отлично! Как твои дела?', isAI: true },
                    { message: 'Я изучаю программирование!', isAI: false },
                    { message: 'Это здорово! Программирование - очень полезный навык!', isAI: true },
                    { message: 'Спасибо за поддержку!', isAI: false }
                ];
                
                demoMessages.forEach(msg => {
                    this.addMessage(user.id, msg.message, msg.isAI);
                });
            }
        });
        
        // Добавить демо-факты
        const demoFacts = [
            'Демид любит программировать на Python',
            'Настя хорошо рисует и поёт',
            'Дима увлекается видеоиграми',
            'Мика любит активный отдых на природе',
            'Демид и Настя - отличная пара ❤️',
            'Дима и Мика - лучшие друзья 👫'
        ];
        
        demoFacts.forEach(fact => {
            this.learnFact(fact, 'system');
        });
        
        console.log('🎮 Добавлены демо-данные');
    },
    
    // Миграция данных
    migrateData(oldData) {
        const currentVersion = this.config.version;
        const oldVersion = oldData.version || '0.1.0';
        
        if (oldVersion !== currentVersion) {
            console.log(`🔄 Миграция данных с ${oldVersion} на ${currentVersion}`);
            
            // Пример миграции: добавление новых полей
            if (!oldData.gameScores) {
                oldData.gameScores = {};
            }
            
            if (!oldData.statistics) {
                oldData.statistics = {
                    totalUsers: Object.keys(oldData.users || {}).length,
                    totalMessages: 0,
                    totalConversations: 0,
                    dailyActivity: {},
                    peakHours: {}
                };
            }
            
            // Обновить версию
            oldData.version = currentVersion;
        }
    },
    
    // Проверка целостности данных
    validateData() {
        let valid = true;
        
        // Проверить пользователей
        for (const userId in this.data.users) {
            const user = this.data.users[userId];
            
            if (!user.id || !user.name || !user.created) {
                console.warn(`⚠️ Невалидный пользователь: ${userId}`);
                delete this.data.users[userId];
                valid = false;
            }
        }
        
        // Пересчитать статистику
        this.recalculateStatistics();
        
        return valid;
    },
    
    // Пересчёт статистики
    recalculateStatistics() {
        this.data.statistics.totalUsers = Object.keys(this.data.users).length;
        this.data.statistics.totalConversations = Object.keys(this.data.conversations).length;
        
        let totalMessages = 0;
        for (const userId in this.data.conversations) {
            totalMessages += this.data.conversations[userId].length;
        }
        this.data.statistics.totalMessages = totalMessages;
    },
    
    // Сохранение данных
    save() {
        try {
            // Обновить статистику перед сохранением
            this.recalculateStatistics();
            
            // Добавить метаданные
            const dataToSave = {
                ...this.data,
                version: this.config.version,
                lastSaved: new Date().toISOString(),
                size: JSON.stringify(this.data).length
            };
            
            localStorage.setItem('ai_assistant_database', JSON.stringify(dataToSave));
            
            console.log(`💾 База сохранена (${dataToSave.size} байт)`);
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            return false;
        }
    },
    
    // Настройка автосохранения
    setupAutoSave() {
        if (this.config.autoSave !== false) {
            setInterval(() => {
                if (this.hasUnsavedChanges()) {
                    this.save();
                }
            }, 60000); // Каждую минуту
        }
    },
    
    // Проверка изменений
    hasUnsavedChanges() {
        // Простая проверка по времени последнего изменения
        const lastSave = localStorage.getItem('ai_last_save_time');
        const currentTime = Date.now();
        
        if (!lastSave) return true;
        
        // Если прошло больше 30 секунд с последнего сохранения
        return (currentTime - parseInt(lastSave)) > 30000;
    },
    
    // Настройка резервного копирования
    setupBackup() {
        setInterval(() => {
            this.createBackup();
        }, this.config.backupInterval);
    },
    
    // Создание резервной копии
    createBackup() {
        try {
            const backupKey = `ai_backup_${new Date().toISOString().split('T')[0]}`;
            const backupData = JSON.stringify(this.data);
            
            // Сохранить только последние 7 копий
            this.cleanupOldBackups(7);
            
            localStorage.setItem(backupKey, backupData);
            console.log(`📂 Создана резервная копия: ${backupKey}`);
        } catch (error) {
            console.error('❌ Ошибка создания резервной копии:', error);
        }
    },
    
    // Очистка старых резервных копий
    cleanupOldBackups(keepLast = 7) {
        const backupKeys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('ai_backup_')) {
                backupKeys.push(key);
            }
        }
        
        // Сортировать по дате (старые первые)
        backupKeys.sort();
        
        // Удалить старые копии
        while (backupKeys.length > keepLast) {
            const oldKey = backupKeys.shift();
            localStorage.removeItem(oldKey);
            console.log(`🗑️ Удалена старая резервная копия: ${oldKey}`);
        }
    },
    
    // Регистрация пользователя
    registerUser(userId, userName, avatarColor = '#2196f3') {
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                id: userId,
                name: userName,
                avatarColor: avatarColor,
                created: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                messageCount: 0,
                gameStats: {
                    ticTacToe: { wins: 0, losses: 0, draws: 0 },
                    math: { score: 0, games: 0 },
                    memory: { bestTime: null, bestMoves: null }
                },
                preferences: {
                    theme: 'dark',
                    language: 'ru',
                    notifications: true
                }
            };
            
            console.log(`👤 Зарегистрирован новый пользователь: ${userName} (${userId})`);
        } else {
            // Обновить существующего пользователя
            this.data.users[userId].name = userName;
            this.data.users[userId].lastSeen = new Date().toISOString();
            this.data.users[userId].avatarColor = avatarColor;
        }
        
        this.save();
        return this.data.users[userId];
    },
    
    // Получение пользователя
    getUser(userId) {
        return this.data.users[userId] || null;
    },
    
    // Получение всех пользователей
    getAllUsers(sortBy = 'lastSeen') {
        const users = Object.values(this.data.users);
        
        switch(sortBy) {
            case 'name':
                return users.sort((a, b) => a.name.localeCompare(b.name));
            case 'messages':
                return users.sort((a, b) => b.messageCount - a.messageCount);
            case 'created':
                return users.sort((a, b) => new Date(b.created) - new Date(a.created));
            default: // lastSeen
                return users.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
        }
    },
    
    // Поиск пользователей по имени
    findUsersByName(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.getAllUsers().filter(user => 
            user.name.toLowerCase().includes(term)
        );
    },
    
    // Добавление сообщения
    addMessage(userId, message, isAI = false) {
        if (!this.data.conversations[userId]) {
            this.data.conversations[userId] = [];
        }
        
        const conversation = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: userId,
            message: message,
            isAI: isAI,
            timestamp: new Date().toISOString(),
            metadata: {
                length: message.length,
                containsQuestion: message.includes('?'),
                containsExclamation: message.includes('!')
            }
        };
        
        this.data.conversations[userId].push(conversation);
        
        // Обновить статистику пользователя
        if (this.data.users[userId]) {
            this.data.users[userId].messageCount++;
            this.data.users[userId].lastSeen = new Date().toISOString();
        }
        
        // Обновить общую статистику
        this.updateStatistics();
        
        // Ограничить количество сообщений
        if (this.data.conversations[userId].length > this.config.maxMessagesPerUser) {
            this.data.conversations[userId] = this.data.conversations[userId].slice(-this.config.maxMessagesPerUser);
        }
        
        this.save();
        return conversation;
    },
    
    // Обновление статистики
    updateStatistics() {
        const now = new Date();
        const dateKey = now.toISOString().split('T')[0];
        const hourKey = now.getHours();
        
        // Ежедневная активность
        if (!this.data.statistics.dailyActivity[dateKey]) {
            this.data.statistics.dailyActivity[dateKey] = 0;
        }
        this.data.statistics.dailyActivity[dateKey]++;
        
        // Часы пик
        if (!this.data.statistics.peakHours[hourKey]) {
            this.data.statistics.peakHours[hourKey] = 0;
        }
        this.data.statistics.peakHours[hourKey]++;
    },
    
    // Получение диалога пользователя
    getUserConversation(userId, limit = null) {
        const conversation = this.data.conversations[userId] || [];
        
        if (limit && limit > 0) {
            return conversation.slice(-limit);
        }
        
        return conversation;
    },
    
    // Очистка диалога пользователя
    clearUserChat(userId) {
        if (this.data.conversations[userId]) {
            const messageCount = this.data.conversations[userId].length;
            this.data.conversations[userId] = [];
            
            console.log(`🗑️ Очищен диалог пользователя ${userId} (${messageCount} сообщений)`);
            this.save();
            return true;
        }
        return false;
    },
    
    // Обучение ИИ (добавление факта)
    learnFact(fact, taughtBy = 'unknown') {
        const learned = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            fact: fact,
            taughtBy: taughtBy,
            timestamp: new Date().toISOString(),
            verified: false,
            usageCount: 0
        };
        
        this.data.learnedFacts.push(learned);
        
        // Ограничить количество фактов
        if (this.data.learnedFacts.length > 1000) {
            this.data.learnedFacts = this.data.learnedFacts.slice(-1000);
        }
        
        this.save();
        console.log(`🎓 Новый факт: "${fact}" (от: ${taughtBy})`);
        return learned;
    },
    
    // Получение фактов
    getLearnedFacts(options = {}) {
        let facts = [...this.data.learnedFacts];
        
        // Фильтрация
        if (options.search) {
            const searchTerm = options.search.toLowerCase();
            facts = facts.filter(fact => 
                fact.fact.toLowerCase().includes(searchTerm)
            );
        }
        
        if (options.taughtBy) {
            facts = facts.filter(fact => fact.taughtBy === options.taughtBy);
        }
        
        // Сортировка
        if (options.sortBy === 'recent') {
            facts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (options.sortBy === 'usage') {
            facts.sort((a, b) => b.usageCount - a.usageCount);
        }
        
        // Пагинация
        if (options.limit) {
            facts = facts.slice(0, options.limit);
        }
        
        return facts;
    },
    
    // Получение фактов о пользователе
    getFactsAboutUser(userName) {
        const name = userName.toLowerCase();
        const facts = [];
        
        // Искать в выученных фактах
        this.data.learnedFacts.forEach(fact => {
            if (fact.fact.toLowerCase().includes(name)) {
                facts.push({
                    ...fact,
                    type: 'learned'
                });
            }
        });
        
        // Искать в диалогах
        for (const userId in this.data.conversations) {
            const user = this.data.users[userId];
            const conversation = this.data.conversations[userId];
            
            conversation.forEach(msg => {
                if (!msg.isAI && msg.message.toLowerCase().includes(name)) {
                    facts.push({
                        id: msg.id,
                        fact: `Пользователь ${user?.name || 'Неизвестный'} сказал: "${msg.message}"`,
                        taughtBy: userId,
                        timestamp: msg.timestamp,
                        type: 'conversation'
                    });
                }
            });
        }
        
        return facts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    // Увеличение счётчика использования факта
    incrementFactUsage(factId) {
        const fact = this.data.learnedFacts.find(f => f.id === factId);
        if (fact) {
            fact.usageCount++;
            this.save();
        }
    },
    
    // Обновление результатов игры
    updateGameScore(userId, gameType, result) {
        if (!this.data.gameScores[userId]) {
            this.data.gameScores[userId] = {};
        }
        
        if (!this.data.gameScores[userId][gameType]) {
            this.data.gameScores[userId][gameType] = {
                wins: 0,
                losses: 0,
                draws: 0,
                score: 0,
                lastPlayed: null,
                bestScore: 0
            };
        }
        
        const gameStats = this.data.gameScores[userId][gameType];
        gameStats.lastPlayed = new Date().toISOString();
        
        switch(result.type) {
            case 'win':
                gameStats.wins++;
                gameStats.score += 10;
                break;
            case 'loss':
                gameStats.losses++;
                break;
            case 'draw':
                gameStats.draws++;
                gameStats.score += 5;
                break;
            case 'score':
                if (result.score > gameStats.bestScore) {
                    gameStats.bestScore = result.score;
                }
                gameStats.score += result.score;
                break;
        }
        
        // Обновить статистику пользователя
        if (this.data.users[userId] && this.data.users[userId].gameStats) {
            Object.assign(this.data.users[userId].gameStats[gameType], gameStats);
        }
        
        this.save();
        return gameStats;
    },
    
    // Получение результатов игры
    getGameScores(userId, gameType = null) {
        if (!this.data.gameScores[userId]) {
            return gameType ? null : {};
        }
        
        if (gameType) {
            return this.data.gameScores[userId][gameType] || null;
        }
        
        return this.data.gameScores[userId];
    },
    
    // Получение лидерборда
    getLeaderboard(gameType, limit = 10) {
        const scores = [];
        
        for (const userId in this.data.gameScores) {
            const user = this.data.users[userId];
            const gameScore = this.data.gameScores[userId][gameType];
            
            if (user && gameScore) {
                scores.push({
                    userId: userId,
                    name: user.name,
                    score: gameScore.score,
                    wins: gameScore.wins,
                    bestScore: gameScore.bestScore
                });
            }
        }
        
        return scores
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    },
    
    // Проверка админского пароля
    checkAdmin(password) {
        return password === this.config.adminPassword;
    },
    
    // Получение статистики
    getStatistics() {
        return {
            ...this.data.statistics,
            activeUsers: this.getAllUsers().filter(u => {
                const lastSeen = new Date(u.lastSeen);
                const now = new Date();
                const hoursDiff = (now - lastSeen) / (1000 * 60 * 60);
                return hoursDiff < 24; // Активны в последние 24 часа
            }).length,
            topUsers: this.getAllUsers('messages').slice(0, 5),
            recentActivity: Object.entries(this.data.statistics.dailyActivity)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 7)
                .map(([date, count]) => ({ date, count })),
            peakHours: Object.entries(this.data.statistics.peakHours)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        };
    },
    
    // Экспорт данных
    exportData(format = 'json') {
        const data = {
            ...this.data,
            exportDate: new Date().toISOString(),
            exportVersion: this.config.version
        };
        
        switch(format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.convertToCSV(data);
            default:
                return data;
        }
    },
    
    // Конвертация в CSV
    convertToCSV(data) {
        // Простая реализация для демонстрации
        let csv = 'Тип,Количество\n';
        csv += `Пользователи,${data.statistics.totalUsers}\n`;
        csv += `Сообщения,${data.statistics.totalMessages}\n`;
        csv += `Диалоги,${data.statistics.totalConversations}\n`;
        csv += `Факты,${data.learnedFacts.length}\n`;
        return csv;
    },
    
    // Импорт данных
    importData(importedData, merge = true) {
        try {
            const parsed = typeof importedData === 'string' 
                ? JSON.parse(importedData) 
                : importedData;
            
            if (merge) {
                // Объединение данных
                Object.assign(this.data.users, parsed.users || {});
                Object.assign(this.data.conversations, parsed.conversations || {});
                this.data.learnedFacts.push(...(parsed.learnedFacts || []));
                Object.assign(this.data.gameScores, parsed.gameScores || {});
            } else {
                // Замена данных
                this.data = parsed;
            }
            
            this.validateData();
            this.save();
            
            console.log('✅ Данные успешно импортированы');
            return true;
        } catch (error) {
            console.error('❌ Ошибка импорта данных:', error);
            return false;
        }
    },
    
    // Сброс базы данных
    reset() {
        if (confirm('Вы уверены? Это удалит ВСЕ данные без возможности восстановления.')) {
            this.initializeDefaultData();
            this.save();
            
            // Очистить резервные копии
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('ai_backup_')) {
                    localStorage.removeItem(key);
                }
            }
            
            console.log('🔄 База данных сброшена');
            return true;
        }
        return false;
    },
    
    // Генерация отчёта
    generateReport() {
        const stats = this.getStatistics();
        const now = new Date();
        
        return {
            generated: now.toISOString(),
            summary: {
                totalUsers: stats.totalUsers,
                activeUsers: stats.activeUsers,
                totalMessages: stats.totalMessages,
                totalConversations: stats.totalConversations,
                learnedFacts: this.data.learnedFacts.length
            },
            topUsers: stats.topUsers.map(u => ({
                name: u.name,
                messages: u.messageCount,
                lastSeen: u.lastSeen
            })),
            recentActivity: stats.recentActivity,
            peakHours: stats.peakHours,
            storage: {
                users: Object.keys(this.data.users).length,
                conversations: Object.keys(this.data.conversations).length,
                messages: stats.totalMessages,
                facts: this.data.learnedFacts.length,
                totalSize: JSON.stringify(this.data).length
            }
        };
    }
};