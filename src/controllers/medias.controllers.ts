import { Request, Response, NextFunction } from 'express'
import mediasService from '~/services/medias.services'

export const uploadSingleImageControllers = async (req: Request, res: Response, next: NextFunction) => {
const result = await mediasService.handleUploadSingleImage(req)
return res.json({
  result: result
})
}