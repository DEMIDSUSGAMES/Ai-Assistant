// Управление чатом
const Chat = {
    // Открыть чат
    open() {
        showScreen('chat-screen');
        loadMessages();
        
        // Если чат пустой, показать приветствие
        if (document.getElementById('chat-messages').children.length === 0) {
            const greeting = AI.generateResponse('привет', App.userId, App.userName);
            addMessage(greeting, 'ai');
        }
    },

    // Отправить сообщение
    send() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Обработка команды /admin
        if (message.startsWith('/admin')) {
            const response = AI.generateResponse(message, App.userId, App.userName);
            addMessage(response, 'ai');
            
            if (response.includes('админ-панели разрешён')) {
                setTimeout(() => {
                    showAdminPanel();
                }, 1000);
            }
            
            input.value = '';
            return;
        }
        
        // Режим обучения
        if (App.isTeaching) {
            const response = AI.generateResponse(message, App.userId, App.userName);
            addMessage(response, 'ai');
            App.isTeaching = false;
            input.value = '';
            return;
        }
        
        // Добавить сообщение пользователя
        addMessage(message, 'user');
        input.value = '';
        
        // Показать индикатор набора
        document.getElementById('typing').style.display = 'block';
        
        // ИИ думает
        setTimeout(() => {
            document.getElementById('typing').style.display = 'none';
            
            const response = AI.generateResponse(message, App.userId, App.userName);
            addMessage(response, 'ai');
            
            // Прокрутить вниз
            scrollToBottom();
        }, 800 + Math.random() * 700);
    },

    // Очистить чат
    clear() {
        if (confirm('Очистить историю чата?')) {
            AI.clearChat(App.userId);
            document.getElementById('chat-messages').innerHTML = '';
            document.getElementById('ai-menu').classList.remove('active');
            
            const greeting = AI.generateResponse('привет', App.userId, App.userName);
            addMessage(greeting, 'ai');
            
            showNotification('Чат очищен', 'success');
        }
    },

    // Показать память
    showMemory() {
        const memory = AI.getUserMemory(App.userId);
        addMessage(memory, 'ai');
        document.getElementById('ai-menu').classList.remove('active');
    },

    // Научить ИИ
    teach() {
        addMessage('Отлично! Напиши что-нибудь, и я это запомню! Например: "Демид любит программирование"', 'ai');
        App.isTeaching = true;
        document.getElementById('ai-menu').classList.remove('active');
    }
};

// Функции для работы с сообщениями
function addMessage(text, sender) {
    const messages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    
    messages.appendChild(messageDiv);
    scrollToBottom();
}

function loadMessages() {
    const messages = document.getElementById('chat-messages');
    messages.innerHTML = '';
    
    const conversation = AI.getConversation(App.userId);
    
    conversation.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.isAI ? 'ai' : 'user'}-message`;
        messageDiv.textContent = msg.text;
        messages.appendChild(messageDiv);
    });
    
    scrollToBottom();
}

function scrollToBottom() {
    setTimeout(() => {
        const messages = document.getElementById('chat-messages');
        messages.scrollTop = messages.scrollHeight;
    }, 100);
}