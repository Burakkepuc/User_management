// utils/webSocket.js
const WebSocket = require('ws');
const connectedClients = new Map();

const sendNotification = (userId, message) => {
  const userSocket = connectedClients.get(parseInt(userId));
  if (userSocket) {
    userSocket.send(JSON.stringify(message));
  }
};

const initializeWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === 'register') {
        connectedClients.set(parsedMessage.userId, ws);
      }
    });

    ws.on('close', () => {
      connectedClients.forEach((client, userId) => {
        if (client === ws) {
          connectedClients.delete(userId);
        }
      });
    });
  });
};

module.exports = {
  sendNotification,
  initializeWebSocketServer,
};
