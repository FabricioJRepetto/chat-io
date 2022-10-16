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
    typing = false

app.use(cors())
app.use(morgan('dev'))

io.on('connection', (socket) => {
    console.log('user connected', socket.id)
    socket.emit('newConnection', { usersOnline, id: socket.id })

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

    //? DISCONNECT
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
        usersOnline = usersOnline.filter(u => u.id !== socket.id)

        socket.broadcast.emit('connectionsUpdate', { usersOnline })
        socket.broadcast.emit('newMessage', {
            message: `${socket.username} letf the chat`,
            from: 'system'
        })
    })

})

server.listen(PORT, () => {
    console.log('Server listening on port ', PORT);
})

app.get('/', (req, res, next) => res.send('Chat server.'))