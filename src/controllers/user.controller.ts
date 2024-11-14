import { Request, Response } from 'express';
import { User } from '../models/user.model';
import multer from 'multer';
import crypto from 'crypto';
import sharp from 'sharp';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import dotenv from 'dotenv';
dotenv.config();

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    if (!updatedUser) {
      res.status(404).send({ message: 'User not found' });
      return;
    }
    res.status(200).send({
      message: 'User has been updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'User update failed', error });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'User has been deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'User delete failed', error });
  }
};

export const getAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      res.status(404).send({ message: 'User cant be found' });
      return;
    }
    res
      .status(200)
      .send({ message: 'User has been found successfully', admin });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'User query failed', error });
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
upload.single('image');

const randomImageName = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!bucketName || !bucketRegion || !accessKey || !secretAccessKey) {
  throw new Error(
    'AWS S3 configuration is missing. Please check your environment variables.'
  );
}

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

export const createUserPhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log('req.body', req.body);
    console.log('req.file', req.file);

    if (!req.file) {
      res.status(400).json({ error: 'Image file is required.' });
      return;
    }

    const buffer = await sharp(req?.file?.buffer)
      .resize({
        height: 300,
        width: 300,
        fit: 'contain',
      })
      .toBuffer();

    const imageName = randomImageName();

    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: req?.file?.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const getObjectParams = {
      Bucket: bucketName,
      Key: imageName,
    };

    const getCommand = new GetObjectCommand(getObjectParams);
    const imageUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

    const { phoneNumber } = req.body;
    const user = await User.findOne({ phoneNumber: phoneNumber });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (user.imageName) {
      const deleteParams = {
        Bucket: bucketName,
        Key: user.imageName,
      };
      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await s3.send(deleteCommand);
    }

    user.imageName = imageName;
    user.imageUrl = imageUrl;
    await user.save();

    res
      .status(200)
      .json({ message: 'Image uploaded and updated successfully.', user });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image.' });
  }
};

export const deleteUserPhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber: phoneNumber });

    if (!user || !user.imageName) {
      res.status(404).json({ error: 'User or image not found.' });
      return;
    }

    const deleteParams = {
      Bucket: bucketName,
      Key: user.imageName,
    };
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deleteCommand);

    user.imageName = undefined;
    user.imageUrl = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: 'Image deleted successfully from S3 and MongoDB.' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image.' });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = req.query.latest;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(3)
      : await User.find();
    res
      .status(200)
      .send({ message: 'User has been found successfully', data: users });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'User query failed', error });
  }
};

export const getUserStat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
    const userStats = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: 1 },
        },
      },
    ]);
    res
      .status(200)
      .send({ message: 'User Data Retrieved successfully', userStats });
  } catch (error: any) {
    console.log(error);
    res.status(500).send({
      message: 'An error occurred aquiring User Stat',
      error: error.message,
    });
  }
};
