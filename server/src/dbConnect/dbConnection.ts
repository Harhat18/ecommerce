import mongoose from 'mongoose';
import 'dotenv/config';

export const dbConnect = async () => {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    throw new Error('DB_URL is not defined');
  }
  try {
    await mongoose.connect(dbUrl);
    console.log('Database has been connected successfully');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};
