import { Request, Response, NextFunction } from 'express'
import path from "path"
import fs from 'fs'
import formidable, { File } from "formidable"
import { reject } from 'lodash'
import { UPLOAD_TEMP_DIR } from '~/constants/dis'

export const initFolder = () => { 
  if(!fs.existsSync(UPLOAD_TEMP_DIR)){
    fs.mkdirSync(UPLOAD_TEMP_DIR), {
      recursive: true
    }
  }
}

export const handleUploadSingleImage = async (req: Request) => {
    // sử dụng trong trường hợp không hỗ trợ khai báo ES modu
  // const formidable = (await import('formidable')).default
  const form = formidable({ 
    uploadDir: UPLOAD_TEMP_DIR, 
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

export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('.')
}