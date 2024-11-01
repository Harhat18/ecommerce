import { Request, Response } from 'express';

import { User } from '../models/user.model';
import { MyConnection } from '../models/myConnections.model';

import { clients, io } from '../..';

function sendEventToClient(phoneNumber: string, message: object) {
  clients
    .filter((client) => client.phoneNumber === phoneNumber)
    .forEach((client) =>
      client.res.write(`data: ${JSON.stringify(message)}\n\n`)
    );
}

export const updateUserLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber, location } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      res.status(404).json({ errMessage: 'Kullanıcı bulunamadı' });
      return;
    }

    user.location = location;
    await user.save();

    const confirmedConnections = await MyConnection.findOne({ user: user._id })
      .populate('connections', 'phoneNumber')
      .exec();

    if (confirmedConnections && confirmedConnections.connections.length > 0) {
      console.log('location mesajları yollandı');
      confirmedConnections.connections.forEach((connection: any) => {
        const message = {
          message: `konumum değişti ${user.phoneNumber}`,
          phoneNumber: user.phoneNumber,
          location,
        };

        console.log(`Sending location update to: ${connection.phoneNumber}`);
        io.to(connection.phoneNumber).emit('locationUpdate', message);
      });
    }

    res.status(200).json({ message: 'Konum güncellendi', location });
  } catch (error) {
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
  }
};

export const getAllConnectedUsersLocations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      res.status(404).json({ errMessage: 'Kullanıcı bulunamadı' });
      return;
    }

    const connections = await MyConnection.findOne({ user: user._id })
      .populate('connections', 'phoneNumber location')
      .exec();

    if (!connections || connections.connections.length === 0) {
      res.status(404).json({ errMessage: 'Bağlantılı kullanıcı bulunamadı' });
      return;
    }

    const connectedUsersLocations = connections.connections.map(
      (connection: any) => ({
        phoneNumber: connection.phoneNumber,
        location: connection.location,
      })
    );

    res.status(200).json({ locations: connectedUsersLocations });
  } catch (error) {
    res.status(500).json({ errMessage: 'Sunucu hatası', error });
  }
};
