const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    format: async (req: any, file: any) => 'png',
    public_id: (req: any, file: any) => {
      const timestamp = Date.now();
      const fileName = file.originalname.split('.')[0];
      return `${fileName}-${timestamp}`;
    },
    transformation: [
      { width: 1000, crop: 'scale' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  },
});

export const parser = multer({ storage: storage });
