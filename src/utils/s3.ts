const S3 = require('aws-sdk/clients/s3');
import 'dotenv/config';

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

//upload function

export function uploadFile() {
  const uploadParams = {
    Bucket: bucketName,
    Body: 'file content',
    Key: 'my-file.txt',
  };
  return s3.upload(uploadParams).promise();
}
