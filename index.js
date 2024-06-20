const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true,path: "/siparis" });



app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  console.log('A new client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    
    // Gelen siparişi tüm bağlı istemcilere gönder
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;

  if (pathname === '/siparis') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Server çalışıyor https://siparis-sistemi.fatihhangulec.com/siparis');
});
