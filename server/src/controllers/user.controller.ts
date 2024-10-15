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
