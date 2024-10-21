import { Request, Response } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { io } from '../..';

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
export const codeSend = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, deviceId, socketId } = req.body;

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      const newUser = new User({ phoneNumber, deviceId, socketId });
      const verificationCode = generateVerificationCode();
      newUser.verificationCode = verificationCode;
      newUser.lastVerificationAttempt = new Date();
      await newUser.save();
      const token = jwt.sign(
        { userId: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET as string
      );
      console.log(`Yeni kullanici kodu: ${verificationCode}`);
      res.status(201).json({ message: 'Kod gönderildi', user: newUser, token });
      return;
    }

    const currentTime = new Date();
    const timeSinceLastAttempt = user.lastVerificationAttempt
      ? currentTime.getTime() - user.lastVerificationAttempt.getTime()
      : 0;

    if (user.verificationAttempts >= 3 && timeSinceLastAttempt < 60000) {
      const timeRemaining = 60000 - timeSinceLastAttempt;
      const minutesRemaining = Math.floor(timeRemaining / 60000);
      const secondsRemaining = Math.floor((timeRemaining % 60000) / 1000);
      res.status(429).json({
        message: 'Günlük istek limitine ulaşıldı.',
        timeRemaining: `Kalan Süre ${minutesRemaining}:${secondsRemaining}`,
      });
      return;
    }

    if (timeSinceLastAttempt >= 60000) {
      user.verificationAttempts = 0;
    }

    const verificationCode = generateVerificationCode();
    user.deviceId = deviceId;
    user.verificationCode = verificationCode;
    user.verificationAttempts += 1;
    user.lastVerificationAttempt = new Date();
    await user.save();
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET as string
    );
    console.log(`Kullanici kodu: ${verificationCode}`);
    res.status(200).json({ message: 'Kod gönderildi', user, token });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, code, deviceId, socketId } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (!user || user.verificationCode !== code) {
      return res.status(400).json({ message: 'Geçersiz kod' });
    }

    if (user && user.deviceId !== deviceId) {
      if (user.socketId) {
        io.to(user.socketId).emit('deviceChange', {
          message: 'Uygulama başka bir cihazda açıldı.',
        });
      }
      user.deviceId = deviceId;
      user.socketId = socketId;
      user.isVerify = true;
      user.verificationCode = null;
      await user.save();
    }
    if (user) {
      user.verificationCode = null;
      user.isVerify = true;
      await user.save();
    }

    res.status(200).json({ message: 'Kullanıcı doğrulandı', user });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};
