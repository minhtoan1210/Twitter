import express, { Request, Response, NextFunction } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { isProduction } from './constants/config'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dis'
import staticRouter from './routes/statics.routes'

config()
const app = express()
const port = 4000
console.log(isProduction)
databaseService.connect()
initFolder()



app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)

app.use('/static', staticRouter)

//c1 doc hinh
app.use('/medias', express.static(UPLOAD_IMAGE_DIR))

// c1 doc video
// app.use('/medias', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
