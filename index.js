import express from 'express'
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import http from "http";
import cors from 'cors'
import { config } from './config.js'

const app = express()

app.use(cors())
app.use(morgan('dev'))

const server = http.createServer(app)
const io = new SocketServer(server, { cors: { origin: '*' } })


io.on('connection', socket => {
    console.log(socket.id)
    socket.on('mensaje', (room, user) => {
        console.log(room, user)
        if (room !== '')
            socket.broadcast.to(room).emit('server-receive-message', user)
    }
    )
    socket.on('auth', (user) => {
        // const id = user.name + user.ci + user.mesa
        console.log('auth', user)
        socket.broadcast.emit('add', user)
    })
    socket.on('join', room => {
        console.log('join: ' + room)
        socket.join(room)
        socket.broadcast.emit('added', room)
    })
    socket.on('djoin', room => {
        console.log('djoin: ' + room)
        socket.leave(room)
        socket.broadcast.emit('paused', room)
    })
    socket.on('erase', room => {
        console.log('erase: ' + room)
        socket.leave(room)
        socket.broadcast.emit('erased', room)
    })
})


server.listen(config.port)
console.log('server started on ', config.port)