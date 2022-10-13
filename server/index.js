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
    })

let connections = 0,
    lastTyping = 0,
    typing = false

app.use(cors())
app.use(morgan('dev'))

io.on('connection', (socket) => {
    console.log('user connected', socket.id)
    connections++

    socket.emit('newConnection', { connections, id: socket.id })
    socket.broadcast.emit('connectionsUpdate', { connections })

    socket.on('username', (username) => {
        console.log(username);
        socket.username = username

        socket.broadcast.emit('newMessage', {
            message: `${socket.username} joined`,
            from: 'system'
        })
    })


    socket.on('newMessage', (message) => {
        console.log(message);
        socket.emit('newMessage', { message, from: socket.username, id: socket.id })
        socket.broadcast.emit('newMessage', { message, from: socket.username, id: socket.id })
    })

    socket.on('isTyping', () => {
        lastTyping = Date.now()
        typing = true
        socket.broadcast.emit('userTyping', socket.username)
        StopTypingWatcher();
    })
    socket.on('isNotTyping', () => {
        typing = false
        socket.broadcast.emit('userStopTyping')
    })

    const StopTypingWatcher = () => {
        setTimeout(() => {
            let aux = Date.now() - lastTyping
            if (aux > 1000 && typing) {
                socket.broadcast.emit('userStopTyping')
                typing = false
            }
        }, 2000);
    }

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
        connections--
        socket.broadcast.emit('userUpdate', {
            update: {
                message: `${socket.username} left the chat`,
                from: 'system'
            },
            connections
        })
    })

})

server.listen(PORT, () => {
    console.log('Server listening on port ', PORT);
})

app.get('/', (req, res, next) => res.send('Chat server.'))