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
import { uploadFileToS3 } from "~/utils/s3";
import mime from 'mime'
import fsPromise from 'fs/promises'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'

config()
class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullname(file.newFilename)
    // console.log("file", file)
    const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)
    return isProduction ? `${process.env.HOST}/medias/${newName}.jpg` : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`
  }

  async uploadMultipleImageServices(req: Request) {
    const files = await handleUploadMultipleImage(req)
    const result: Media[] = await Promise.all(files.map(async files => {
      const newName = getNameFromFullname(files.newFilename)
      const newFullFilename = `${newName}.jpg`
      const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
      await sharp(files.filepath).jpeg().toFile(newPath)
      console.log("newPath", newPath)
      console.log("newFullFilename", newFullFilename)
      console.log("mime.getType(newPath)", mime.getType(newPath))
      const s3Result = await uploadFileToS3({
        filename: 'images/' + newFullFilename,
        filepath: newPath,
        contentType: mime.getType(newPath) as string
      })

      console.log("s3Result", s3Result)
      // fs.unlinkSync(files.filepath)
      await Promise.all([fsPromise.unlink(files.filepath), fsPromise.unlink(newPath)])
        return {
          url: (s3Result as any)?.Location as string,
          type: MediaType.Image
        }
      // return {
      //  url:  isProduction 
      //  ? `${process.env.HOST}/medias/${newName}.jpg` 
      //  : `http://localhost:${process.env.PORT}/medias/${newName}.jpg`,
      //  type: MediaType.Image
      // }
    }))
    return result
  }

  async uploadMultipleVideoServices(req: Request) {
    const files = await handleUploadMultipleVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        console.log("file.filepath", file.filepath + ".1233.mp4")
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath + "." + file.originalFilename) as string,
          filepath: file.filepath + "." + file.originalFilename
        })
        fsPromise.unlink(file.filepath + "." + file.originalFilename)
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
      })
    )
    return result

  //   const {newFilename} = files[0]
  //   return {
  //     url:  isProduction 
  //     ? `${process.env.HOST}/static/video/${newFilename}` 
  //     : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
  //     type: MediaType.Video
  //    }
   }
}

const mediasService = new MediasService();

export default mediasService;