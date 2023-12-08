import express, { Request, Response, NextFunction } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dis'
import staticRouter from './routes/statics.routes'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
import cors from 'cors'
// import '~/utils/s3';
import { createServer } from "http";
import { Server } from "socket.io";
config()
const app = express()
const httpServer = createServer(app);
const port = 4000
// console.log(isProduction)
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  // databaseService.indexFollowers()
})
initFolder()

app.use(cors())
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/static', staticRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)

//c1 doc hinh
app.use('/medias', express.static(UPLOAD_IMAGE_DIR))

// c1 doc video
// app.use('/medias', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`)
  const users_id = socket.handshake.auth._id
  users[users_id] = {
    socket_id: socket.id
  }


  console.log("users", users)
  socket.on('private message', (data) => {
    const receiver_socket_id = users[data.to].socket_id
    socket.to(receiver_socket_id).emit('private message', {
      const: data.content,
      from: users_id
    })
  })

  // socket.on('hello', (data) => {
  //   console.log("data", data)
  // })

  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnect`)
    delete users[users_id]
    console.log("users", users)

  })
});

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
