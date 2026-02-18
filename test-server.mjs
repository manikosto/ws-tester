import { WebSocketServer } from 'ws';

const port = 8085;
const wss = new WebSocketServer({ port });

console.log(`Echo WS server running on ws://localhost:${port}`);

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (data) => {
    const msg = data.toString();
    console.log(`Received: ${msg}`);
    ws.send(`echo:${msg}`);
  });
  ws.on('close', () => console.log('Client disconnected'));
});
