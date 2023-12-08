import { config } from 'dotenv'
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, S3 } from "@aws-sdk/client-s3";
import fs from 'fs'
import path from 'path';

config()
const s3 = new S3({ region: process.env.AWS_REGION })
s3.listBuckets({}).then((data) => console.log(data))
// export const uploadFileToS3 = ({
//   filename, filepath, contentType
// }: {
//   filename: string
//   filepath: string
//   contentType: string
// }) => {
//   // const file = fs.readFileSync(path.resolve('uploads/images/96c459727acd3a500e2c3cc01.jpg'))
//   const parallelUploads3 = new Upload({
//     client: s3,
//     params: { Bucket: 'twitter-cloneee-ap-southeast-1', Key: filename, Body: fs.readFileSync(filepath), ContentType: contentType },
//     tags: [
//       /*...*/
//     ], // optional tags
//     queueSize: 4, // optional concurrency configuration
//     partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
//     leavePartsOnError: false, // optional manually handle dropped parts
//   });

//   // parallelUploads3.on("httpUploadProgress", (progress) => {
//   //   console.log(progress);
//   // });

//   return parallelUploads3.done()
// }


export const uploadFileToS3 = ({
  filename,
  filepath,
  contentType
}: {
  filename: string
  filepath: string
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: 'twitter-cloneee-ap-southeast-1',
      Key: filename,
      Body: fs.readFileSync(filepath),
      ContentType: contentType
    },
    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  })
  return parallelUploads3.done()
}
