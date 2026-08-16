const firebaseConfig = {
    databaseURL: "https://kasir-flop-chat-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const dbChat = firebase.database().ref("standalone_tchat_messages");
const dbAccounts = firebase.database().ref("chat_accounts");

let activeUser = null;

document.addEventListener("DOMContentLoaded", () => {
    const savedAccount = localStorage.getItem("tchat_standalone_user");
    if (savedAccount) {
        activeUser = JSON.parse(savedAccount);
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('chatRoom').style.display = 'flex';
        initChatListener();
    }
});

function submitLogin() {
    const user = document.getElementById('loginUser').value.trim().toUpperCase();
    const pass = document.getElementById('loginPass').value.trim();

    if (!user || !pass) {
        alert("User ID dan Password wajib diisi!");
        return;
    }

    dbAccounts.child(user).once('value', (snapshot) => {
        if (snapshot.exists()) {
            const accData = snapshot.val();
            if (accData.password === pass) {
                activeUser = { 
                    username: user,
                    avatar: accData.avatar || ("https://api.dicebear.com/7.x/bottts/svg?seed=" + user)
                };
                localStorage.setItem("tchat_standalone_user", JSON.stringify(activeUser));
                document.getElementById('authModal').style.display = 'none';
                document.getElementById('chatRoom').style.display = 'flex';
                initChatListener();
            } else {
                alert("❌ Password salah!");
            }
        } else {
            alert("❌ User ID tidak ditemukan!");
        }
    });
}

function logoutChat() {
    localStorage.removeItem("tchat_standalone_user");
    location.reload();
}

function sendChatMessage() {
    if (!activeUser) return;
    const textInput = document.getElementById('chatText');
    const messageText = textInput.value.trim();

    if (messageText) {
        dbChat.push({
            user: activeUser.username,
            avatar: activeUser.avatar,
            msg: messageText,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });
        textInput.value = '';
    }
}

function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
}

function initChatListener() {
    dbChat.limitToLast(50).on('child_added', (snapshot) => {
        const data = snapshot.val();
        renderMessage(snapshot.key, data);
    });
}

function renderMessage(key, data) {
    const chatLogs = document.getElementById('chatLogs');
    const isSelf = activeUser && data.user === activeUser.username;

    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg-wrapper ${isSelf ? 'own-msg' : ''}`;
    
    wrapper.innerHTML = `
        <img class="msg-avatar" src="${data.avatar}" alt="Avatar">
        <div class="chat-msg">
            <div style="font-size: 11px; color: #a855f7; font-weight: bold; margin-bottom: 2px;">${data.user}</div>
            <div>${data.msg}</div>
            <div style="font-size: 9px; color: #888; text-align: right; margin-top: 4px;">${data.timestamp}</div>
        </div>
    `;

    chatLogs.appendChild(wrapper);
    chatLogs.scrollTop = chatLogs.scrollHeight;
}
