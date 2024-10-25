import { Request, Response } from 'express';

import { User } from '../models/user.model';
import { ConnectionRequest } from '../models/connection.model';
import { io } from '../..';
import { MyConnection } from '../models/myConnections.model';
import { log } from 'console';

export const sendConnectionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { senderPhoneNumber, receiverPhoneNumber } = req.body;

    const sender = await User.findOne({ phoneNumber: senderPhoneNumber });
    const receiver = await User.findOne({ phoneNumber: receiverPhoneNumber });

    if (!sender || !receiver) {
      res.status(200).json({ errMessage: 'Kullanıcı bulunamadı' });
      return;
    }

    if (senderPhoneNumber == receiverPhoneNumber) {
      res
        .status(200)
        .json({ errMessage: 'Kendinize bağlantı isteği yollayamazsınız' });
      return;
    }

    const existingConnection = await MyConnection.findOne({
      user: sender._id,
      connections: receiver._id,
    });
    if (existingConnection) {
      res
        .status(200)
        .json({ errMessage: 'Bu kullanıcıyla zaten bağlantılısınız' });
      return;
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: sender._id,
      receiver: receiver._id,
    });
    if (existingRequest) {
      res
        .status(200)
        .json({ errMessage: 'Zaten bir istek gönderdiniz', existingRequest });
      return;
    }

    const newRequest = new ConnectionRequest({
      sender: sender._id,
      receiver: receiver._id,
    });

    await newRequest.save();

    console.log('receiver?.socketId', receiver?.socketId);

    if (receiver?.socketId)
      io.to(receiver?.socketId).emit('connectionRequest', {
        message: 'Yeni bağlantı isteği aldınız',
        request: newRequest,
      });
    res
      .status(201)
      .json({ message: 'Bağlantı isteği gönderildi', request: newRequest });
  } catch (error) {
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
  }
};

export const respondToRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { requestId, action } = req.body;

    const request = await ConnectionRequest.findById(requestId)
      .populate('sender', 'phoneNumber')
      .populate('receiver', 'phoneNumber');

    if (!request) {
      res.status(404).json({ errMessage: 'İstek bulunamadı' });
      return;
    }

    const sender = request.sender as any;
    const receiver = request.receiver as any;

    if (action === 'accept') {
      // Gönderici ve alıcı için bağlantı listelerini bul
      let senderConnections = await MyConnection.findOne({ user: sender._id });
      let receiverConnections = await MyConnection.findOne({
        user: receiver._id,
      });

      // Eğer senderConnections yoksa, yeni bir doküman oluştur
      if (!senderConnections) {
        senderConnections = new MyConnection({
          user: sender._id,
          connections: [],
        });
      }
      // Eğer receiverConnections yoksa, yeni bir doküman oluştur
      if (!receiverConnections) {
        receiverConnections = new MyConnection({
          user: receiver._id,
          connections: [],
        });
      }
      // Bağlantı sayısı kontrolü (8 adet ile sınırlı)
      if (
        senderConnections.connections.length >= 8 ||
        receiverConnections.connections.length >= 8
      ) {
        res.status(400).json({ errMessage: 'Bağlantı sınırına ulaşıldı' });
        return;
      }

      senderConnections.connections.push(receiver._id);
      receiverConnections.connections.push(sender._id);

      await senderConnections.save();
      await receiverConnections.save();

      await ConnectionRequest.findByIdAndDelete(requestId);

      res.status(200).json({
        message:
          'Bağlantı kabul edildi ve her iki kullanıcının bağlantılarına eklendi',
        connections: {
          sender: senderConnections.connections,
          receiver: receiverConnections.connections,
        },
      });
    } else if (action === 'reject') {
      await ConnectionRequest.findByIdAndDelete(requestId);
      res.status(200).json({ message: 'Bağlantı isteği reddedildi' });
    } else {
      res.status(400).json({ errMessage: 'Geçersiz işlem' });
    }

    // Socket Bildirimleri
    if (sender?.socketId) {
      io.to(sender.socketId).emit('requestResponse', {
        message: `Bağlantı isteğiniz ${
          action === 'accept' ? 'kabul' : 'reddedildi'
        } edildi`,
        request,
      });
    }

    if (receiver?.socketId) {
      io.to(receiver.socketId).emit('requestResponse', {
        message: `Bir bağlantı isteğini ${
          action === 'accept' ? 'kabul' : 'reddettiniz'
        }`,
        request,
      });
    }
  } catch (error) {
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
  }
};

export const getConnectionRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber } = req.params;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      res.status(404).json({ errMessage: 'Kullanıcı bulunamadı' });
      return;
    }

    const requests = await ConnectionRequest.find({ receiver: user._id })
      .populate('sender', 'phoneNumber')
      .exec();

    if (requests.length === 0) {
      res.status(200).json({ message: 'Bağlantı isteği bulunamadı' });
      return;
    }

    res
      .status(200)
      .json({ message: 'Bana Yapılan Bağlantı istekleri', requests });
  } catch (error) {
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
  }
};

export const getSentConnection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber } = req.params;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      res.status(404).json({ errMessage: 'Kullanıcı bulunamadı' });
      return;
    }

    const requests = await ConnectionRequest.find({ sender: user._id })
      .populate('receiver', 'phoneNumber')
      .exec();

    if (requests.length === 0) {
      res
        .status(200)
        .json({ message: 'Gönderilen bağlantı isteği bulunamadı' });
      return;
    }

    res
      .status(200)
      .json({ message: 'Gönderilen bağlantı istekleri', requests });
  } catch (error) {
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
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
      res.status(200).json({ errMessage: 'Bağlantı bulunamadı' });
      return;
    }

    await ConnectionRequest.findByIdAndDelete(connectionId);
    res.status(201).json({ message: 'Bağlantı silindi' });
  } catch (error) {
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
  }
};

export const getConfirmedConnections = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber } = req.params;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      res.status(200).json({ errMessage: 'Kullanıcı bulunamadı' });
      return;
    }

    const confirmedConnections = await MyConnection.findOne({ user: user._id })
      .populate('connections', 'phoneNumber')
      .exec();

    if (
      !confirmedConnections ||
      confirmedConnections.connections.length === 0
    ) {
      res.status(200).json({ message: 'Onaylanan bağlantı bulunamadı' });
      return;
    }

    res.status(200).json({
      message: 'Onaylanan bağlantılar',
      connections: confirmedConnections.connections,
    });
  } catch (error) {
    console.error('Error fetching confirmed connections:', error);
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
  }
};

export const deleteConfirmedConnection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber, userPhoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber: userPhoneNumber });
    if (!user) {
      res.status(200).json({ errMessage: 'Kullanıcı bulunamadı' });
      return;
    }

    const confirmedConnections = await MyConnection.findOne({ user: user._id });
    if (
      !confirmedConnections ||
      confirmedConnections.connections.length === 0
    ) {
      res.status(200).json({ message: 'Onaylanan bağlantı bulunamadı' });
      return;
    }

    // Silinmek istenen telefon numarasını bul
    const connectionIndex = confirmedConnections.connections.findIndex(
      (conn: any) => conn.phoneNumber === phoneNumber
    );

    if (connectionIndex === -1) {
      res.status(200).json({ message: 'Bağlantı bulunamadı' });
      return;
    }

    // Bağlantıyı sil
    confirmedConnections.connections.splice(connectionIndex, 1);
    await confirmedConnections.save(); // Değişiklikleri kaydet

    res.status(200).json({
      message: 'Bağlantı başarıyla silindi',
      connections: confirmedConnections.connections,
    });
  } catch (error) {
    console.error('Error deleting confirmed connection:', error);
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
  }
};
