import { Request, Response } from 'express';

import { User } from '../models/user.model';
import { ConnectionRequest } from '../models/connection.model';
import { io } from '../..';
import { Document } from 'mongoose';

export const sendConnectionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { senderPhoneNumber, receiverPhoneNumber } = req.body;

    const sender = await User.findOne({ phoneNumber: senderPhoneNumber });
    const receiver = await User.findOne({ phoneNumber: receiverPhoneNumber });

    if (!sender || !receiver) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      return;
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: sender._id,
      receiver: receiver._id,
    });
    if (existingRequest) {
      res.status(400).json({ message: 'Zaten bir istek gönderdiniz' });
      return;
    }

    const newRequest = new ConnectionRequest({
      sender: sender._id,
      receiver: receiver._id,
    });

    await newRequest.save();
    if (receiver?.socketId)
      io.to(receiver?.socketId).emit('connectionRequest', {
        message: 'Yeni bağlantı isteği aldınız',
        request: newRequest,
      });
    res
      .status(201)
      .json({ message: 'Bağlantı isteği gönderildi', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

export const respondToRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { requestId, action } = req.body;

    const request = await ConnectionRequest.findById(requestId)
      .populate('sender')
      .populate('receiver');
    if (!request) {
      res.status(404).json({ message: 'İstek bulunamadı' });
      return;
    }
    const sender = request.sender as any;
    const receiver = request.receiver as any;

    if (action === 'accept') {
      request.status = 'accepted';
    } else if (action === 'reject') {
      request.status = 'rejected';
    } else {
      res.status(400).json({ message: 'Geçersiz işlem' });
      return;
    }

    await request.save();
    if (sender?.socketId) {
      io.to(sender.socketId).emit('requestResponse', {
        message: `Bağlantı isteğiniz ${request.status} edildi`,
        request,
      });
    }

    if (receiver?.socketId) {
      io.to(receiver.socketId).emit('requestResponse', {
        message: `Bir bağlantı isteğini ${request.status} ettiniz`,
        request,
      });
    }

    res
      .status(200)
      .json({ message: `İstek ${request.status} edildi`, request });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

export const deleteConnection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { connectionId } = req.body;

    const connection = await ConnectionRequest.findById(connectionId);
    if (!connection) {
      res.status(404).json({ message: 'Bağlantı bulunamadı' });
      return;
    }

    await ConnectionRequest.findByIdAndDelete(connectionId);
    res.status(200).json({ message: 'Bağlantı silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};
