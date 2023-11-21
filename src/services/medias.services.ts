import { Request } from "express";
import { getNameFromFullname, handleUploadMultipleImage, handleUploadMultipleVideo, handleUploadSingleImage, } from "~/utils/file";
import sharp from 'sharp'
import {  UPLOAD_IMAGE_DIR } from "~/constants/dis";
import path from "path";
import fs from 'fs'
import { isProduction } from "~/constants/config";
import { config } from "dotenv";
import { MediaType } from "~/constants/enums";
import { Media } from "~/models/Orther";

config()
class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullname(file.newFilename)
    console.log("file", file)
    const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)
    return isProduction ? `${process.env.HOST}/medias/${newName}.jpg` : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`
  }

  async uploadMultipleImageServices(req: Request) {
    const files = await handleUploadMultipleImage(req)
    const result: Media[] = await Promise.all(files.map(async files => {
      const newName = getNameFromFullname(files.newFilename)
      console.log("file", files)
      const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
      await sharp(files.filepath).jpeg().toFile(newPath)
      fs.unlinkSync(files.filepath)
      return {
       url:  isProduction 
       ? `${process.env.HOST}/medias/${newName}.jpg` 
       : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`,
       type: MediaType.Image
      }
    }))
    return result
  }

  async uploadMultipleVideoServices(req: Request) {
    const files = await handleUploadMultipleVideo(req)
    const {newFilename} = files[0]
    return {
      url:  isProduction 
      ? `${process.env.HOST}/static/video/${newFilename}` 
      : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
      type: MediaType.Video
     }
  }
}

const mediasService = new MediasService();

export default mediasService;