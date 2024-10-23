import { Request, Response } from 'express';

import { User } from '../models/user.model';
import { ConnectionRequest } from '../models/ConnectionRequest.model';

export const sendConnectionRequest = async (req: Request, res: Response) => {
  try {
    const { senderPhoneNumber, receiverPhoneNumber } = req.body;

    const sender = await User.findOne({ phoneNumber: senderPhoneNumber });
    const receiver = await User.findOne({ phoneNumber: receiverPhoneNumber });

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: sender._id,
      receiver: receiver._id,
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Zaten bir istek gönderdiniz' });
    }

    const newRequest = new ConnectionRequest({
      sender: sender._id,
      receiver: receiver._id,
    });

    await newRequest.save();
    res
      .status(201)
      .json({ message: 'Bağlantı isteği gönderildi', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

export const respondToRequest = async (req: Request, res: Response) => {
  try {
    const { requestId, action } = req.body; // 'accept' or 'reject'

    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'İstek bulunamadı' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
    } else if (action === 'reject') {
      request.status = 'rejected';
    } else {
      return res.status(400).json({ message: 'Geçersiz işlem' });
    }

    await request.save();
    res
      .status(200)
      .json({ message: `İstek ${request.status} edildi`, request });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

export const deleteConnection = async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.body;

    const connection = await ConnectionRequest.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: 'Bağlantı bulunamadı' });
    }

    await ConnectionRequest.findByIdAndDelete(connectionId);
    res.status(200).json({ message: 'Bağlantı silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};
