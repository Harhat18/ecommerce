import { Request, Response } from 'express';
import { User } from '../models/user.model';

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
    const { password, ...info } = admin.toObject();
    res
      .status(200)
      .send({ message: 'User has been found successfully', data: info });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'User query failed', error });
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
