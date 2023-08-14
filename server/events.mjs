export default function (io) {
    io.on('connection', (socket) => {
        console.log(`A user connected: ${socket.id}`);

        socket.on('player-connect', () => {
            socket.emit('player-connected', {
                playerID: socket.id,
                log: `${socket.id} player connected`
            });
        });

        socket.on('join-room', (roomID) => {
            let clients = socket.adapter.rooms.get(roomID);
            if ((clients ? clients.size : 0) < 2) {
                socket.join(roomID);
                io.in(roomID).emit('joined-room', {
                    joined: true,
                    roomID: roomID,
                    playerCount: socket.adapter.rooms.get(roomID).size,
                    log: `${socket.id} joined room: ${roomID}`
                });
            } else {
                socket.emit('joined-room', {
                    joined: false,
                    log: `Room is full: ${roomID}`
                });
            }
        });

        socket.on('leave-room', (roomID) => {
            socket.leave(roomID);
            let clients = socket.adapter.rooms.get(roomID);
            socket.to(roomID).emit('left-room', {
                playerCount: clients ? clients.size : 0,
                log: `${socket.id} left room: ${roomID}`
            });
        })

        socket.on('send-message', ({ roomID, message }) => {
            socket.to(roomID).emit('sent-message', {
                playerID: socket.id,
                message: message,
                log: `${socket.id} sent message to room: ${roomID}`
            });
        });

        socket.on('start-game', ({ roomID }) => {
            let clients = Array.from(socket.adapter.rooms.get(roomID));
            if (clients.length === 2) {
                let startPlayer = clients[Math.floor(Math.random() * clients.length)];

                io.in(roomID).emit('started-game', {
                    startedGame: true,
                    startPlayer: startPlayer,
                    log: `Game started in room: ${roomID}`
                });
            } else {
                io.in(roomID).emit('started-game', {
                    startedGame: false,
                    log: `Not enough players in room: ${roomID}`
                });
            }
        });

        socket.on('update-grid', ({ roomID, playerID, playerMark, i, j }) => {
            let clients = Array.from(socket.adapter.rooms.get(roomID));
            clients.splice(clients.indexOf(playerID), 1);
            let nextPlayer = clients[0];
            io.in(roomID).emit('updated-grid', {
                nextPlayer: nextPlayer,
                playerID: playerID,
                playerMark: playerMark,
                i: i,
                j: j,
                log: `${playerID} made a move in: ${i}, ${j}`
            });
        });
    });
}