const GITHUB_TOKEN = ''; // Replace with your token
const REPO_OWNER = 'Hunter-Lovett'; // Replace with your GitHub username
const REPO_NAME = 'Personal-chat-Testing1.0'; // Replace with your repository name

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
    
    // Load saved username
    const savedName = localStorage.getItem('username');
    if (savedName) {
        document.getElementById('nameInput').value = savedName;
    }
});

// Save username when changed
document.getElementById('nameInput').addEventListener('change', function() {
    localStorage.setItem('username', this.value);
});

// Handle Enter key
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const nameInput = document.getElementById('nameInput');
    const sendButton = document.querySelector('button');
    const message = messageInput.value.trim();
    const name = nameInput.value.trim() || 'Anonymous';

    if (message) {
        try {
            sendButton.disabled = true;
            const status = document.getElementById('status');
            status.textContent = 'Sending message...';
            status.className = '';

            // Trigger GitHub Action
            await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    event_type: 'new-message',
                    client_payload: {
                        name: name,
                        message: message,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            messageInput.value = '';
            status.textContent = 'Message sent! Updating...';
            
            // Wait a bit for GitHub Action to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
            await loadMessages();
            status.textContent = '';
        } catch (error) {
            console.error('Error sending message:', error);
            document.getElementById('status').textContent = 'Error sending message. Please try again.';
            document.getElementById('status').className = 'error';
        } finally {
            sendButton.disabled = false;
        }
    }
}

async function loadMessages() {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/data/messages.json`);
        const data = await response.json();
        
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.innerHTML = '';

        data.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerHTML = `
                <span class="username">${msg.name}</span>: 
                ${msg.message}
                <span class="timestamp">${new Date(msg.timestamp).toLocaleString()}</span>
            `;
            messageContainer.appendChild(messageDiv);
        });

        messageContainer.scrollTop = messageContainer.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Auto-refresh messages
setInterval(loadMessages, 10000);