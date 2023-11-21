import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dis'
import HTTP_STATUS from '~/constants/httpStatus'
import mediasService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime'

export const uploadSingleImageControllers = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadSingleImage(req)
  return res.json({
    result: result
  })
}

export const uploadMultipleImageControllers = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.uploadMultipleImageServices(req)
  return res.json({
    result: result
  })
}

export const uploadMultipleVideoControllers = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.uploadMultipleVideoServices(req)
  return res.json({
    result: result
  })
}

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    {
      if (err) {
        res.status((err as any).status).send('Not found')
      }
    }
  })
}

export const serveVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range
 console.log("ASdsa", range)
 if(!range){
  return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
 }
 const { name } = req.params
 const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
 const videoSize = fs.statSync(videoPath).size
 const chunkSize = 30 * 10 ** 6
 const start = Number(range.replace(/\D/g, ''))
 const end = Math.min(start + chunkSize, videoSize - 1)
 const contentLength = end - start + 1
 const contentType = mime.getType(videoPath) || 'video/*'
 const headers = {
  'Content-Range': `bytes ${start}-${end}/${videoSize}`,
  'Accept-Ranges': 'bytes',
  'Content-Length': contentLength,
  'Content-Type': contentType
}
res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
const videoSteams = fs.createReadStream(videoPath, { start, end })
videoSteams.pipe(res)

}