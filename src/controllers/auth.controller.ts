import { Request, Response } from 'express';
import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';
import { io } from '../..';

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
export const codeSend = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, deviceId, isAdmin } = req.body;
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      const newUser = new User({ phoneNumber, deviceId, isAdmin });
      const token = jwt.sign(
        { phoneNumber: phoneNumber, isAdmin: isAdmin },
        process.env.JWT_SECRET as string
      );
      const verificationCode = generateVerificationCode();
      newUser.verificationCode = verificationCode;
      newUser.lastVerificationAttempt = new Date();
      newUser.token = token;
      await newUser.save();

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
    const token = jwt.sign(
      { phoneNumber: user.phoneNumber, isAdmin: user.isAdmin },
      process.env.JWT_SECRET as string
    );
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationAttempts += 1;
    user.lastVerificationAttempt = new Date();
    user.isAdmin = isAdmin;
    user.token = token;
    await user.save();

    console.log(`Kullanici kodu: ${verificationCode}`);
    res.status(200).json({ message: 'Kod gönderildi', user, token });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, code, deviceId, socketId } = await req.body;
    const user = await User.findOne({ phoneNumber });
    if (!user || user.verificationCode !== code) {
      res.status(201).send({ message: 'Geçersiz kod' });
      return;
    }
    if (user.deviceId !== deviceId) {
      if (phoneNumber) {
        io.to(phoneNumber).emit('deviceChange', {
          message: 'Uygulama başka bir cihazda açıldı.',
          deviceId: deviceId,
        });
        user.deviceId = deviceId;
        user.socketId = socketId;
        user.isVerify = true;
        user.verificationCode = null;
        await user.save();
      }
    } else {
      user.socketId = socketId;
      user.deviceId = deviceId;
      user.verificationCode = null;
      user.isVerify = true;
      await user.save();
    }
    res.status(201).json({ message: 'Kullanıcı kayıt edildi', user });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};
