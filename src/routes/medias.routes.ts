import { Router } from 'express'
import { uploadMultipleImageControllers, uploadMultipleVideoControllers, uploadSingleImageControllers } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(uploadSingleImageControllers))
mediasRouter.post('/upload-image-multiple', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(uploadMultipleImageControllers))
mediasRouter.post('/upload-video-multiple', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(uploadMultipleVideoControllers))
export default mediasRouter  