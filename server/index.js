import express from 'express'
import morgan from 'morgan'
import { Server as SocketServer } from 'socket.io'
import http from 'http'
import cors from 'cors'

const app = express(),
    PORT = process.env.PORT || 4000,
    server = http.createServer(app),
    io = new SocketServer(server, {
        cors: {
            origin: '*'
        }
    }),
    COLORS = [
        '#F94144',
        '#F3722C',
        '#F8961E',
        '#F9844A',
        '#F9C74F',
        '#90BE6D',
        '#43AA8B',
        '#4D908E',
        '#577590',
        '#277DA1'
    ]

let usersOnline = [],
    lastTyping = 0,
    typing = false,
    rooms = {}

app.use(cors())
app.use(morgan('dev'))

io.on('connection', (socket) => {
    console.log('+ user connected', socket.id)
    socket.emit('newConnection', { usersOnline, id: socket.id })

    const roomManager = (room) => {
        if (rooms[room]) {
            let aux = [...rooms[room]?.usersList]
            aux = aux.filter(u => u.id !== socket.id)
            rooms[room].usersList = [...aux]

            socket.leave(room)

            if (rooms[room]?.usersList.length > 0) {
                io.to(room).emit('leaveRoom', { message: `${socket.username} left the room`, users: aux })
                // io.to(room).emit('roomUsersUpdate', { message: `${socket.username} left the room`, users: aux })
            } else {
                console.log(`Closing room ${room}`);
                delete rooms[room]
            }
        }
    }

    //? CONNECTIONS
    // solo cuando el usuario elije un nickname
    // se muestra la conección y el mensaje
    socket.on('username', (username) => {
        let random = Math.floor(Math.random() * 9.9)
        socket.username = username
        socket.color = COLORS[random]
        usersOnline.push({ user: username, id: socket.id, color: COLORS[random] })

        socket.emit('newConnection', { usersOnline, id: socket.id })
        socket.broadcast.emit('connectionsUpdate', { usersOnline })

        socket.broadcast.emit('newMessage', {
            message: `${socket.username} joined`,
            from: 'system'
        })
    })

    //? MESSAGES
    socket.on('newMessage', (message) => {
        socket.emit('newMessage', { message, from: socket.username, id: socket.id, color: socket.color })
        socket.broadcast.emit('newMessage', { message, from: socket.username, id: socket.id, color: socket.color })
    })

    //? PRIVATE MESSAGE
    socket.on('privateMessage', (payload) => {
        let aux = {
            from: {
                id: socket.id,
                name: socket.username,
                color: socket.color,
            },
            to: payload.to,
            message: payload.message,
            private: true
        }
        socket.emit('privateMessage', aux)
        socket.to(payload.to.id).emit('privateMessage', aux)
    })
    socket.on('DMisTyping', (id) => {
        typing = true
        socket.to(id).emit('DMisTyping', { id: socket.id, typing: true })
        StopTypingWatcher(id)
    })
    socket.on('DMisNotTyping', (id) => {
        typing = false
        socket.to(id).emit('DMStopTyping', { id: socket.id, typing: false })
    })

    //? IS TYPING
    socket.on('isTyping', () => {
        lastTyping = Date.now()
        // esta variable sirve para saber si el usuario presionó enter (aka dejó de typear)
        typing = true
        socket.broadcast.emit('userTyping', socket.username)
        // tambien ejecuta el watcher
        StopTypingWatcher();
    })
    // si el usuario presiona enter, se quita el "is typing" sin esperar el timeout
    socket.on('isNotTyping', () => {
        typing = false
        socket.broadcast.emit('userStopTyping', false)
    })
    const StopTypingWatcher = (id) => {
        // despues de 2 seg comprueba si pasó 1 seg desde el ultimo typeo
        // si es true Y la variable typing también, quita el "is typing"
        setTimeout(() => {
            let aux = Date.now() - lastTyping
            if (aux > 1000 && typing) {
                id
                    ? socket.to(id).emit('DMStopTyping', { id: socket.id, typing: false })
                    : socket.broadcast.emit('userStopTyping')
                typing = false
            }
        }, 2000);
    }

    //? TaTeTi
    socket.on('TTTRoom', (room) => {
        if (socket.rooms.has(room)) return console.log('User already conencted to this room')

        socket.join(room)
        console.log(`${socket.username} joined room ${room}`);

        if (rooms[room]) {
            if (rooms[room].usersList.length < 2) {
                rooms[room].usersList.push({
                    name: socket.username,
                    id: socket.id,
                    role: 'player'
                })
                rooms[room].score[socket.id] = 0
                console.log(`Player ${socket.username} connected to room ${room}`);
            } else {
                rooms[room].usersList.push({
                    name: socket.username,
                    id: socket.id,
                    role: 'spectator'
                })
                console.log(`Spectator ${socket.username || 'X'} connected to room ${room}`);
            }
            socket.emit('roomUpdate', rooms[room])
        } else {
            rooms[room] = {
                board: {
                    row0: [null, null, null],
                    row1: [null, null, null],
                    row2: [null, null, null]
                },
                usersList: [
                    {
                        name: socket.username,
                        id: socket.id,
                        role: 'owner'
                    }
                ],
                winCondition: 0,
                rounds: 0,
                score: {
                    [socket.id]: 0
                },
                continue: []
            }
            console.log(`${socket.username} created room ${room}`)
        }

        io.to(room).emit('roomUsersUpdate', { users: rooms[room].usersList, message: `${socket.username} has joined the room` });
    })
    socket.on('movement', (m) => {
        console.log('movement: ', m);
        io.to(m.room).emit('movement', m)
        //: actualizar tablero local
    })
    socket.on('roundEnd', ({ m, room, type }) => {
        rooms[room].rounds += 1
        rooms[room].board = {
            row0: [null, null, null],
            row1: [null, null, null],
            row2: [null, null, null]
        }
        type === 'winner' && (rooms[room].score[socket.id] += 1)

        if (rooms[room].score[socket.id] === rooms[room].winCondition) {
            //: final winner

            let aux = {}
            for (const key of Object.keys(rooms[room].score)) {
                aux[key] = 0
            }

            rooms[room].score = { ...aux }
            rooms[room].rounds = 0

            io.to(room).emit('movement', { ...m, final: true })
            setTimeout(() => socket.emit('roomUpdate', rooms[room]), 2000);
        } else {
            io.to(room).emit('movement', m)
        }
    })
    socket.on('start', ({ room, winCon }) => {
        //: config
        rooms[room].winCondition = winCon
        io.to(room).emit('start')
    })
    socket.on('playerReady', ({ room, id }) => {
        if (!rooms[room].continue.includes(id)) rooms[room].continue.push(id)

        if (rooms[room].continue.length > 1) {
            io.to(room).emit('continue', {
                rounds: rooms[room].rounds,
                score: rooms[room].score
            })
            rooms[room].continue = []
        }
    })
    socket.on('leaveRoom', (room) => {
        roomManager(room)
    })

    //? DISCONNECT
    socket.on("disconnecting", () => {
        socket.rooms.forEach(r => {
            roomManager(r)
        })
    })
    socket.on('disconnect', () => {
        console.log('- user disconnected', socket.id)
        usersOnline = usersOnline.filter(u => u.id !== socket.id)

        socket.broadcast.emit('connectionsUpdate', { usersOnline })
        socket.broadcast.emit('newMessage', {
            message: `${socket.username} left the chat`,
            from: 'system'
        })
    })

})

server.listen(PORT, () => {
    console.log('Server listening on port ', PORT);
})

app.get('/', (req, res, next) => res.send(`Users online: ${usersOnline.length} || Rooms up: ${rooms.length || 0}`))