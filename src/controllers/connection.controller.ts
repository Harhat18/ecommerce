import { Request, Response } from 'express';

import { User } from '../models/user.model';
import { ConnectionRequest } from '../models/connection.model';
import { io } from '../..';
import { MyConnection } from '../models/myConnections.model';

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
      .populate('receiver', 'phoneNumber socketId');

    if (!request) {
      res.status(200).json({ errMessage: 'İstek bulunamadı' });
      return;
    }

    const sender = request.sender as any;
    const receiver = request.receiver as any;
    console.log('receiver', receiver);
    if (action === 'accept') {
      let senderConnections = await MyConnection.findOne({ user: sender._id });
      let receiverConnections = await MyConnection.findOne({
        user: receiver._id,
      });
      if (!senderConnections) {
        senderConnections = new MyConnection({
          user: sender._id,
          connections: [],
        });
      }
      if (!receiverConnections) {
        receiverConnections = new MyConnection({
          user: receiver._id,
          connections: [],
        });
      }
      if (
        senderConnections.connections.length >= 8 ||
        receiverConnections.connections.length >= 8
      ) {
        res.status(200).json({ errMessage: 'Bağlantı sınırına ulaşıldı' });
        return;
      }

      senderConnections.connections.push(receiver._id);
      receiverConnections.connections.push(sender._id);

      await senderConnections.save();
      await receiverConnections.save();
      console.log('receiver?.socketId2', receiver?.socketId);
      if (receiver?.socketId)
        io.to(receiver?.socketId).emit('connectionRequest', {
          message: 'Bağlantı isteğiniz onaylandı',
        });
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
      console.log('receiver?.socketId3', receiver?.socketId);
      if (receiver?.socketId)
        io.to(receiver?.socketId).emit('connectionRequest', {
          message: 'Bağlantı isteğiniz reddedildi',
        });
      await ConnectionRequest.findByIdAndDelete(requestId);
      res.status(200).json({ message: 'Bağlantı isteği reddedildi' });
    } else {
      res.status(200).json({ errMessage: 'Geçersiz işlem' });
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
      res.status(200).json({ errMessage: 'Kullanıcı bulunamadı' });
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
      res.status(200).json({ errMessage: 'Kullanıcı bulunamadı' });
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

    const connection = await ConnectionRequest.findById(connectionId)
      .populate('receiver', 'socketId')
      .populate('sender', 'socketId');

    console.log('connection', connection);

    if (!connection) {
      res.status(200).json({ errMessage: 'Bağlantı bulunamadı' });
      return;
    }

    const receiver = connection.receiver as any;
    const sender = connection.sender as any;

    await ConnectionRequest.findByIdAndDelete(connectionId);

    console.log('receiver?.socketId4', receiver?.socketId);

    if (receiver?.socketId) {
      io.to(receiver.socketId).emit('requestResponse', {
        message: 'Bir bağlantı isteginiz silindi',
      });
    }

    // if (sender?.socketId) {
    //   io.to(sender.socketId).emit('requestResponse', {
    //     message: 'Bağlantınız silindi',
    //   });
    // }

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

export const deleteConfirmConnection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { connectionId, phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber }).populate('socketId');
    if (!user) {
      res.status(200).json({ errMessage: 'Kullanıcı bulunamadı' });
      return;
    }

    const userConnections = await MyConnection.findOne({ user: user._id });
    if (!userConnections) {
      res.status(200).json({ errMessage: 'Bağlantı bulunamadı' });
      return;
    }

    const index = userConnections.connections.indexOf(connectionId);
    if (index === -1) {
      res.status(200).json({ errMessage: 'Bağlantı bulunamadı' });
      return;
    }

    userConnections.connections.splice(index, 1);
    await userConnections.save();

    const otherUser = await User.findById(connectionId).populate('socketId');
    const otherConnection = await MyConnection.findOne({ user: connectionId });

    if (otherConnection) {
      const otherIndex = otherConnection.connections.indexOf(user._id as any);
      if (otherIndex !== -1) {
        otherConnection.connections.splice(otherIndex, 1);
        await otherConnection.save();
      }
    }
    console.log('otherUser?.socketId', otherUser?.socketId);
    if (otherUser?.socketId) {
      io.to(otherUser.socketId).emit('requestResponse', {
        message: 'Bağlantınız silindi',
      });
    }
    res.status(200).json({ message: 'Bağlantı silindi' });
  } catch (error) {
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
  }
};
