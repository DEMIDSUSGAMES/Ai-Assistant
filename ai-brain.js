// Умный ИИ с памятью
class AIBrain {
    constructor() {
        this.memory = {
            users: {},
            conversations: {},
            learnedFacts: [],
            secrets: {
                'демид': 'Демид + Настя = любовь ❤️',
                'настя': 'Демид + Настя = любовь ❤️',
                'дима': 'Дима + Мика = лучшие друзья 👫',
                'мика': 'Дима + Мика = лучшие друзья 👫'
            }
        };
        this.load();
    }

    load() {
        const saved = localStorage.getItem('ai_memory');
        if (saved) {
            this.memory = JSON.parse(saved);
        }
    }

    save() {
        localStorage.setItem('ai_memory', JSON.stringify(this.memory));
    }

    // Регистрация пользователя
    registerUser(userId, userName, color = '#2196f3') {
        if (!this.memory.users[userId]) {
            this.memory.users[userId] = {
                id: userId,
                name: userName,
                color: color,
                created: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                messageCount: 0
            };
        } else {
            this.memory.users[userId].name = userName;
            this.memory.users[userId].lastSeen = new Date().toISOString();
            this.memory.users[userId].color = color;
        }
        this.save();
        return this.memory.users[userId];
    }

    // Добавить сообщение
    addMessage(userId, message, isAI = false) {
        if (!this.memory.conversations[userId]) {
            this.memory.conversations[userId] = [];
        }

        const msg = {
            id: Date.now(),
            text: message,
            isAI: isAI,
            time: new Date().toISOString()
        };

        this.memory.conversations[userId].push(msg);

        if (this.memory.users[userId]) {
            this.memory.users[userId].messageCount++;
            this.memory.users[userId].lastSeen = new Date().toISOString();
        }

        // Ограничить историю
        if (this.memory.conversations[userId].length > 100) {
            this.memory.conversations[userId] = this.memory.conversations[userId].slice(-100);
        }

        this.save();
        return msg;
    }

    // Получить диалог
    getConversation(userId) {
        return this.memory.conversations[userId] || [];
    }

    // Очистить чат
    clearChat(userId) {
        if (this.memory.conversations[userId]) {
            this.memory.conversations[userId] = [];
            this.save();
            return true;
        }
        return false;
    }

    // Получить пользователя
    getUser(userId) {
        return this.memory.users[userId];
    }

    // Получить всех пользователей
    getAllUsers() {
        return Object.values(this.memory.users).sort((a, b) => 
            new Date(b.lastSeen) - new Date(a.lastSeen)
        );
    }

    // Научить факту
    learnFact(fact, userId) {
        const cleanFact = fact.replace(/запомни|научи|что|ты|мне|пожалуйста/gi, '').trim();
        
        if (cleanFact.length < 3) return false;
        
        if (!this.memory.learnedFacts.includes(cleanFact)) {
            this.memory.learnedFacts.push(cleanFact);
            this.save();
            return true;
        }
        return false;
    }

    // Получить факты о пользователе
    getFactsAboutUser(userName) {
        const name = userName.toLowerCase();
        const facts = [];
        
        // Искать в выученных фактах
        this.memory.learnedFacts.forEach(fact => {
            if (fact.toLowerCase().includes(name)) {
                facts.push(fact);
            }
        });
        
        return facts;
    }

    // Генерация ответа
    generateResponse(message, userId, userName) {
        const lowerMsg = message.toLowerCase();
        
        // Сохранить сообщение пользователя
        this.addMessage(userId, message, false);
        
        // Проверка на админ-команду
        if (lowerMsg.startsWith('/admin')) {
            if (lowerMsg === '/admin admin123') {
                return "✅ Доступ к админ-панели разрешён! Теперь ты можешь смотреть всех пользователей.";
            }
            return "❌ Неверный пароль администратора";
        }
        
        // Проверка на поиск пользователя
        if (lowerMsg.includes('кто такой') || lowerMsg.includes('что знаешь о')) {
            const nameMatch = lowerMsg.match(/о\s+([а-я]+)/i) || lowerMsg.match(/такой\s+([а-я]+)/i);
            if (nameMatch) {
                return this.searchUserInfo(nameMatch[1]);
            }
        }
        
        // Режим обучения
        if (lowerMsg.includes('запомни') || lowerMsg.includes('научи')) {
            if (this.learnFact(message, userId)) {
                return "✅ Отлично! Запомнил этот факт!";
            }
            return "Я уже это знаю!";
        }
        
        // Проверить секретные знания
        if (userName) {
            const lowerName = userName.toLowerCase();
            for (const name in this.memory.secrets) {
                if (lowerName.includes(name) && Math.random() < 0.3) {
                    return `Знаешь, я кое-что знаю про тебя... ${this.memory.secrets[name]}`;
                }
            }
        }
        
        // Генерация обычного ответа
        let response = '';
        
        if (lowerMsg.includes('привет') || lowerMsg.includes('здравств')) {
            response = `Привет, ${userName}! Рад тебя видеть!`;
        } else if (lowerMsg.includes('пока') || lowerMsg.includes('до свидан')) {
            response = `Пока, ${userName}! Увидимся!`;
        } else if (lowerMsg.includes('как дела')) {
            response = `У меня отлично! А как твои дела, ${userName}?`;
        } else if (lowerMsg.includes('что делаешь')) {
            response = 'Общаюсь с тобой! Это самое интересное занятие 😊';
        } else if (lowerMsg.includes('почему') || lowerMsg.includes('как') || lowerMsg.includes('зачем')) {
            response = 'Интересный вопрос! Давай подумаем над ним вместе.';
        } else if (lowerMsg.includes('расскажи')) {
            response = 'Что тебя интересует? Я могу рассказать много интересного!';
        } else if (lowerMsg.includes('помоги') || lowerMsg.includes('помощь')) {
            response = 'Чем могу помочь? Я умею отвечать на вопросы и запоминать факты!';
        } else if (lowerMsg.includes('спасибо')) {
            response = `Пожалуйста, ${userName}! Всегда рад помочь!`;
        } else {
            const responses = [
                `Интересно, ${userName}! Расскажи подробнее?`,
                `Понял тебя. А что ты думаешь об этом?`,
                `Хм, это действительно интересная мысль!`,
                `Спасибо, что делишься этим, ${userName}!`,
                `Я внимательно слушаю. Продолжай!`
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        
        // Сохранить ответ ИИ
        this.addMessage(userId, response, true);
        
        return response;
    }

    // Поиск информации о пользователе
    searchUserInfo(name) {
        const lowerName = name.toLowerCase();
        let info = `Информация о "${name}":\n\n`;
        
        // Проверить секреты
        if (this.memory.secrets[lowerName]) {
            info += `🔒 Секрет: ${this.memory.secrets[lowerName]}\n\n`;
        }
        
        // Найти в фактах
        const facts = this.getFactsAboutUser(name);
        if (facts.length > 0) {
            info += "📚 Что я знаю:\n";
            facts.forEach(fact => {
                info += `• ${fact}\n`;
            });
        } else {
            info += "Я пока ничего не знаю об этом человеке. Но могу научиться!";
        }
        
        return info;
    }

    // Получить статистику пользователя
    getUserStats(userId) {
        const user = this.getUser(userId);
        const conversation = this.getConversation(userId);
        const facts = this.getFactsAboutUser(user?.name || '');
        
        return {
            name: user?.name || 'Неизвестно',
            messages: conversation.length,
            facts: facts.length,
            created: user?.created || 'неизвестно',
            lastSeen: user?.lastSeen || 'неизвестно',
            totalUsers: Object.keys(this.memory.users).length
        };
    }

    // Получить память о пользователе
    getUserMemory(userId) {
        const user = this.getUser(userId);
        const conversation = this.getConversation(userId);
        const facts = this.getFactsAboutUser(user?.name || '');
        
        let memory = `🧠 Память о ${user?.name || 'тебе'}:\n\n`;
        memory += `• Сообщений: ${conversation.length}\n`;
        memory += `• Фактов: ${facts.length}\n`;
        memory += `• Зарегистрирован: ${new Date(user?.created || Date.now()).toLocaleDateString()}\n\n`;
        
        if (facts.length > 0) {
            memory += "📚 Что я знаю:\n";
            facts.slice(0, 3).forEach(fact => {
                memory += `• ${fact}\n`;
            });
        }
        
        return memory;
    }
}

// Создаём глобальный экземпляр ИИ
const AI = new AIBrain();