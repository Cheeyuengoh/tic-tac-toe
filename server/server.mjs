import http from 'http';
import { Server } from 'socket.io';
import events from './events.mjs';

const PORT = 5050;
const server = http.createServer();
const io = new Server(server, {
    cors: {
        src: ['http://localhost:3000']
    }
});
events(io);

server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});