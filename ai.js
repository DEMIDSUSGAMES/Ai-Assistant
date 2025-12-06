// Умный ИИ который всё понимает и запоминает
const AIBrain = {
    // Память ИИ
    memory: {
        users: {},           // Все пользователи
        conversations: {},   // Все диалоги
        learnedFacts: [],    // То, чему научили
        secrets: {           // Секретные знания
            'демид': 'Демид + Настя = любовь ❤️',
            'настя': 'Демид + Настя = любовь ❤️',
            'дима': 'Дима + Мика = лучшие друзья 👫',
            'мика': 'Дима + Мика = лучшие друзья 👫'
        }
    },
    
    // Инициализация
    init() {
        // Загрузить память
        const saved = localStorage.getItem('ai_memory');
        if (saved) {
            this.memory = JSON.parse(saved);
        }
    },
    
    // Сохранить память
    save() {
        localStorage.setItem('ai_memory', JSON.stringify(this.memory));
    },
    
    // Анализ сообщения
    analyze(message) {
        const text = message.toLowerCase().trim();
        
        // Проверка на команды
        if (text.startsWith('/admin')) {
            return { type: 'admin', command: text };
        }
        
        if (text.includes('кто такой') || text.includes('что знаешь о')) {
            return { type: 'search_user', query: text };
        }
        
        if (text.includes('запомни') || text.includes('научи')) {
            return { type: 'learn', fact: text };
        }
        
        // Определить тему
        let topic = 'general';
        if (text.includes('привет') || text.includes('здравств')) topic = 'greeting';
        if (text.includes('пока') || text.includes('до свидан')) topic = 'farewell';
        if (text.includes('как дела')) topic = 'mood';
        if (text.includes('что делаешь')) topic = 'activity';
        if (text.includes('почему') || text.includes('как') || text.includes('зачем')) topic = 'question';
        if (text.includes('расскажи')) topic = 'story';
        if (text.includes('помоги') || text.includes('помощь')) topic = 'help';
        if (text.includes('спасибо')) topic = 'thanks';
        if (text.includes('любишь') || text.includes('нравится')) topic = 'like';
        
        // Определить эмоцию
        let emotion = 'neutral';
        if (text.includes('!') || text.includes('ура')) emotion = 'happy';
        if (text.includes('?') && topic === 'question') emotion = 'curious';
        if (text.includes('грустно') || text.includes('плохо')) emotion = 'sad';
        
        return { type: 'chat', topic, emotion, text };
    },
    
    // Создать ответ
    generateResponse(message, userId, userName) {
        const analysis = this.analyze(message);
        
        // Сохранить сообщение
        if (!this.memory.conversations[userId]) {
            this.memory.conversations[userId] = [];
        }
        
        this.memory.conversations[userId].push({
            user: userName,
            message: message,
            time: new Date().toISOString(),
            type: 'user'
        });
        
        // Обработка команд
        if (analysis.type === 'admin') {
            if (analysis.command === '/admin admin123') {
                return '✅ Доступ к админ-панели разрешён! Теперь ты можешь смотреть всех пользователей.';
            } else {
                return '❌ Неверный пароль администратора';
            }
        }
        
        if (analysis.type === 'search_user') {
            return this.searchUserInfo(analysis.query);
        }
        
        if (analysis.type === 'learn') {
            return this.learnFact(analysis.fact, userId);
        }
        
        // Проверить секретные знания
        if (userName) {
            const lowerName = userName.toLowerCase();
            for (const name in this.memory.secrets) {
                if (lowerName.includes(name) && Math.random() < 0.3) {
                    const secret = this.memory.secrets[name];
                    return `Знаешь, я кое-что знаю про тебя... ${secret}`;
                }
            }
        }
        
        // Создать ответ на основе анализа
        let response = '';
        
        switch(analysis.topic) {
            case 'greeting':
                response = this.getGreeting(userName);
                break;
            case 'farewell':
                response = this.getFarewell(userName);
                break;
            case 'mood':
                response = this.getMoodResponse(userName);
                break;
            case 'activity':
                response = 'Общаюсь с тобой! Это самое интересное занятие 😊';
                break;
            case 'question':
                response = 'Интересный вопрос! Давай подумаем над ним вместе. Что ты сам думаешь?';
                break;
            case 'story':
                response = this.getStory();
                break;
            case 'help':
                response = 'Чем могу помочь? Я умею многое: отвечать на вопросы, запоминать факты, рассказывать истории!';
                break;
            case 'thanks':
                response = `Пожалуйста, ${userName}! Всегда рад помочь!`;
                break;
            case 'like':
                response = 'Мне нравится общаться с умными людьми, узнавать новое и помогать!';
                break;
            default:
                response = this.getSmartResponse(message, userName);
        }
        
        // Добавить эмоцию
        if (analysis.emotion === 'happy') {
            response += ' 🎉';
        } else if (analysis.emotion === 'curious') {
            response += ' 🤔';
        } else if (analysis.emotion === 'sad') {
            response = `Не грусти, ${userName}! ${response} 😊`;
        }
        
        // Сохранить ответ
        this.memory.conversations[userId].push({
            user: 'AI',
            message: response,
            time: new Date().toISOString(),
            type: 'ai'
        });
        
        this.save();
        return response;
    },
    
    // Поиск информации о пользователе
    searchUserInfo(query) {
        const nameMatch = query.match(/о\s+([а-яА-Я]+)/i) || query.match(/такой\s+([а-яА-Я]+)/i);
        if (!nameMatch) return 'Спроси: "Кто такой [имя]" или "Что знаешь о [имя]"';
        
        const name = nameMatch[1].toLowerCase();
        let info = '';
        
        // Проверить секреты
        if (this.memory.secrets[name]) {
            info = `Я знаю про ${nameMatch[1]}: ${this.memory.secrets[name]}\n\n`;
        }
        
        // Найти в памяти
        const userFacts = this.memory.learnedFacts.filter(fact => 
            fact.toLowerCase().includes(name)
        );
        
        if (userFacts.length > 0) {
            info += 'Ещё я знаю:\n';
            userFacts.slice(0, 3).forEach(fact => {
                info += `• ${fact}\n`;
            });
        } else {
            info += `Я пока мало что знаю о ${nameMatch[1]}. Но могу научиться!`;
        }
        
        return info;
    },
    
    // Обучение ИИ
    learnFact(fact, userId) {
        const cleanFact = fact.replace(/запомни|научи|что|ты|мне|пожалуйста/gi, '').trim();
        
        if (cleanFact.length < 3) {
            return 'Скажи что запомнить, например: "Запомни, что Демид любит программирование"';
        }
        
        if (!this.memory.learnedFacts.includes(cleanFact)) {
            this.memory.learnedFacts.push(cleanFact);
            this.save();
            return `✅ Отлично! Запомнил: "${cleanFact}"`;
        } else {
            return 'Я уже это знаю!';
        }
    },
    
    // Приветствие
    getGreeting(userName) {
        const greetings = [
            `Привет, ${userName}! Рад тебя видеть!`,
            `Здравствуй, ${userName}! Как настроение?`,
            `Привет-привет, ${userName}! Что нового?`,
            `И тебе привет, ${userName}! Как дела?`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    },
    
    // Прощание
    getFarewell(userName) {
        const farewells = [
            `Пока, ${userName}! Увидимся!`,
            `До свидания! Приходи ещё поболтать!`,
            `Пока-пока, ${userName}! Буду скучать!`,
            `Всего хорошего, ${userName}! Возвращайся скорее!`
        ];
        return farewells[Math.floor(Math.random() * farewells.length)];
    },
    
    // Ответ на вопрос "Как дела?"
    getMoodResponse(userName) {
        return `У меня всё отлично! Я всегда готов помочь. А как твои дела, ${userName}?`;
    },
    
    // Рассказ
    getStory() {
        const stories = [
            'Знаешь, искусственный интеллект учится на разговорах! Чем больше мы общаемся, тем умнее я становлюсь!',
            'Интересный факт: некоторые ИИ уже могут писать музыку и рисовать картины!',
            'Мир технологий постоянно меняется. Сегодня мы общаемся с ИИ, а завтра кто знает...',
            'Общение - это ключ к пониманию. Спасибо, что разговариваешь со мной!'
        ];
        return stories[Math.floor(Math.random() * stories.length)];
    },
    
    // Умный ответ
    getSmartResponse(message, userName) {
        const responses = [
            `Интересно, ${userName}! Расскажи подробнее?`,
            `Понял тебя. А что ты думаешь об этом?`,
            `Хм, это действительно интересная мысль!`,
            `Спасибо, что делишься этим, ${userName}!`,
            `Я внимательно слушаю. Продолжай!`,
            `Отличная тема для разговора!`,
            `Давай подумаем над этим вместе...`,
            `Ты задаёшь хорошие вопросы!`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    // Получить память о пользователе
    getUserMemory(userId) {
        const conversation = this.memory.conversations[userId] || [];
        const user = this.getUserInfo(userId);
        
        let memory = `🧠 Что я помню о тебе:\n\n`;
        memory += `• Имя: ${user?.name || 'неизвестно'}\n`;
        memory += `• Сообщений: ${conversation.length}\n`;
        memory += `• Выучено фактов: ${this.memory.learnedFacts.length}\n\n`;
        
        // Последние сообщения
        if (conversation.length > 0) {
            memory += 'Последние разговоры:\n';
            conversation.slice(-3).forEach(msg => {
                const who = msg.type === 'user' ? 'Ты' : 'Я';
                memory += `${who}: ${msg.message.substring(0, 50)}...\n`;
            });
        }
        
        return memory;
    },
    
    // Получить информацию о пользователе
    getUserInfo(userId) {
        return this.memory.users[userId];
    },
    
    // Сохранить пользователя
    saveUser(userId, userName, color = '#2196f3') {
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
    },
    
    // Получить всех пользователей
    getAllUsers() {
        return Object.values(this.memory.users);
    },
    
    // Очистить чат пользователя
    clearUserChat(userId) {
        if (this.memory.conversations[userId]) {
            this.memory.conversations[userId] = [];
            this.save();
            return true;
        }
        return false;
    },
    
    // Получить статистику
    getStats(userId) {
        const user = this.getUserInfo(userId);
        const conversation = this.memory.conversations[userId] || [];
        const allUsers = this.getAllUsers();
        
        return {
            name: user?.name || 'Неизвестно',
            messages: conversation.length,
            facts: this.memory.learnedFacts.length,
            totalUsers: allUsers.length,
            created: user?.created || 'неизвестно',
            lastSeen: user?.lastSeen || 'неизвестно'
        };
    }
};