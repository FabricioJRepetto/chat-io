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

let connections = 0

app.use(cors())
app.use(morgan('dev'))

io.on('connection', (socket) => {
    console.log('user connected', socket.id)
    connections++
    socket.emit('newConnection', { connections, id: socket.id })
    socket.broadcast.emit('newUser', {
        user: `user "${socket.id}" joined`,
        connections
    })

    socket.on('newMessage', (message) => {
        console.log(message);
        socket.emit('newMessage', { message, from: socket.id })
        socket.broadcast.emit('newMessage', { message, from: socket.id })
    })

    socket.on('disconnect', () => {
        connections--
        socket.broadcast.emit('newUser', {
            user: `user "${socket.id}" left`,
            connections
        })
    })

})

server.listen(PORT, () => {
    console.log('Server listening on port ', PORT);
})

app.get('/', (req, res, next) => res.send('Chat server.'))