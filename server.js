const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplikasi Chat Real-time</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #e5ddd5; display: flex; justify-content: center; align-items: center; height: 100vh; }
    #chat-card { width: 100%; max-width: 450px; height: 80vh; background: #fff; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
    #header { background: #075e54; color: white; padding: 15px; text-align: center; font-size: 1.2rem; font-weight: bold; }
    #messages { flex: 1; padding: 15px; overflow-y: auto; list-style: none; display: flex; flex-direction: column; gap: 10px; background: #efeae2; }
    #messages li { max-width: 75%; padding: 8px 12px; border-radius: 8px; font-size: 0.95rem; line-height: 1.4; word-wrap: break-word; }
    .msg-other { background: #ffffff; align-self: flex-start; border-bottom-left-radius: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .msg-self { background: #dcf8c6; align-self: flex-end; border-bottom-right-radius: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .username { font-weight: bold; font-size: 0.75rem; color: #075e54; margin-bottom: 2px; display: block; }
    #form-container { padding: 10px; background: #f0f0f0; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #ccc; }
    .input-row { display: flex; gap: 8px; }
    input { padding: 10px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 0.95rem; }
    #username { width: 100%; border-radius: 8px; }
    #input { flex: 1; }
    button { padding: 10px 18px; background: #128c7e; color: white; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; }
    button:hover { background: #075e54; }
  </style>
</head>
<body>

  <div id="chat-card">
    <div id="header">💬 Room Chat Publik</div>
    <ul id="messages"></ul>
    
    <div id="form-container">
      <input id="username" type="text" placeholder="Masukkan nama kamu..." required />
      <form id="form" class="input-row">
        <input id="input" autocomplete="off" placeholder="Ketik pesan..." required />
        <button type="submit">Kirim</button>
      </form>
    </div>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const usernameInput = document.getElementById('username');
    const messages = document.getElementById('messages');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = usernameInput.value.trim() || 'Anonim';
      const text = input.value.trim();

      if (text) {
        socket.emit('chat message', { user: name, text: text, id: socket.id });
        input.value = '';
      }
    });

    socket.on('chat message', (data) => {
      const item = document.createElement('li');
      const isSelf = data.id === socket.id;
      
      item.classList.add(isSelf ? 'msg-self' : 'msg-other');
      item.innerHTML = \`<span class="username">\${isSelf ? 'Kamu' : data.user}</span>\${data.text}\`;
      
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
    });
  </script>
</body>
</html>
  `);
});

io.on('connection', (socket) => {
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });
});

server.listen(PORT, () => {
  console.log(`Server chat jalan di: http://localhost:${PORT}`);
});
