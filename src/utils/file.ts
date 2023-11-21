import { Request, Response, NextFunction } from 'express'
import path from "path"
import fs from 'fs'
import formidable, { File } from "formidable"
import { reject } from 'lodash'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dis'

export const initFolder = () => { 
  [UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if(!fs.existsSync(dir)){
      fs.mkdirSync(dir, {
        recursive: true
      })
    }
  })
}

export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('.')
}

export const getExtension = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr[namearr.length - 1]
  return namearr.join('.')
}

export const handleUploadSingleImage = async (req: Request) => {
    // sử dụng trong trường hợp không hỗ trợ khai báo ES modu
  // const formidable = (await import('formidable')).default
  const form = formidable({ 
    uploadDir: UPLOAD_IMAGE_TEMP_DIR, 
    maxFiles: 1, 
    keepExtensions: true, 
    maxFileSize: 4000 * 1024, // 300KBS
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File>((resolve, reject) => { 
    form.parse(req, (err, fields, files) => {
      console.log("fields", fields)
      console.log("files", files)

      if(err)
      {
        return reject(err)
      }

      if(!Boolean(files.image))
      {
        return reject(new Error('File is empty'))
      }
      
      resolve((files.image as File[])[0])
    })
  })
}

export const handleUploadMultipleImage = async (req: Request) => {
  // sử dụng trong trường hợp không hỗ trợ khai báo ES modu
// const formidable = (await import('formidable')).default
const form = formidable({ 
  uploadDir: UPLOAD_IMAGE_TEMP_DIR, 
  maxFiles: 4, 
  keepExtensions: true, 
  maxFileSize: 400 * 1024, // 300KBS
  maxTotalFileSize: 400 * 1024 * 4,
  filter: function ({ name, originalFilename, mimetype }) {
    const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
    if (!valid) {
      form.emit('error' as any, new Error('File type is not valid') as any)
    }
    return valid
  }
})

return new Promise<File[]>((resolve, reject) => { 
  form.parse(req, (err, fields, files) => {
    console.log("fields", fields)
    console.log("files", files)

    if(err)
    {
      return reject(err)
    }

    if(!Boolean(files.image))
    {
      return reject(new Error('File is empty'))
    }
    
    resolve((files.image as File[]))
  })
})
}

export const handleUploadMultipleVideo = async (req: Request) => {
const form = formidable({ 
  uploadDir: UPLOAD_VIDEO_DIR, 
  maxFiles: 1, 
  maxFileSize: 50*1024 * 1024, // 300KBS
  maxTotalFileSize: 50*1024 * 1024 * 1,
  filter: function ({ name, originalFilename, mimetype }) {
    const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))

    console.log("asdsa", valid)

    if (!valid) {
      form.emit('error' as any, new Error('File type is not valid') as any)
    }
    return valid
  }
})

return new Promise<File[]>((resolve, reject) => { 
  form.parse(req, (err, fields, files) => {
    console.log("fields", fields)
    console.log("files", files)

    if(err)
    {
      return reject(err)
    }

    if(!Boolean(files.video))
    {
      return reject(new Error('File is empty'))
    }

    const video = files.video as File[]
    video.forEach((video) => {
      const ext = getExtension(video.originalFilename as string)
      fs.renameSync(video.filepath, video.filepath + '.' + ext)
      video.newFilename = video.newFilename + '.' + ext
    })
    
    resolve((files.video as File[]))
  })
})
}
