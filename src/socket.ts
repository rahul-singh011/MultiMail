import {Server} from 'socket.io'
import {Server as HttpServer} from 'http'

let io: Server | null = null

export const initSocket = (httpServer: HttpServer)=>{
    io = new Server(httpServer, {
        cors: {
          origin: '*',
        },
      })

    io.on('connection', (socket)=>{
        console.log(`Client connected: ${socket.id}`)

        socket.on('join', (campaignId: string)=>{
            socket.join(campaignId)
            console.log(`Client ${socket.id} joined campaign room: ${campaignId}`)
        })

        socket.on('disconnected', ()=>{
            console.log(`Client disconnected ${socket.id}`)
        })
    })

    return io
}

export const getIO = (): Server | null => io