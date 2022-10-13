import express from 'express'
import morgan from 'morgan'
import { Server as SocketServer } from 'socket.io'
import http from 'http'
import cors from 'cors'

const app = express(),
    PORT = process.env.PORT || 4000,
    server = http.createServer(app),
    io = new SocketServer(server)

app.use(cors())
app.use(morgan('dev'))

app.listen(PORT, () => {
    console.log('Server listening on port ', PORT);
})

app.get('/', (req, res, next) => res.send('Chat server.'))