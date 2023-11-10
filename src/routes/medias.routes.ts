import { Router } from 'express'
import { uploadSingleImageControllers } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageControllers))
export default mediasRouter  