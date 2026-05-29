import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http' 
import {env} from './config/env'
import {errorHandler} from './middleware/errorHandler'
import authRoutes from './routes/auth'
import campaignRoutes from './routes/campaigns'
import trackingRoutes from './routes/tracking'
import contactRoutes from './routes/contacts'
import { startScheduler } from './jobs/scheduler'
import { initSocket } from './socket'  
import './queues/emailWorker'


const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api/auth' , authRoutes)
app.use('/api/campaigns' , campaignRoutes)
app.use('/api/campaigns/:id/contacts', contactRoutes) 
app.use('/api/track', trackingRoutes)

app.get('/health' , (req,res)=>{
    res.json({status: 'ok' , env:env.NODE_ENV})
})

app.use(errorHandler)

const httpServer = createServer(app)

initSocket(httpServer)

httpServer.listen(env.PORT, ()=>{
    console.log(`MultiMail app running on port ${env.PORT}`)
    startScheduler()
})