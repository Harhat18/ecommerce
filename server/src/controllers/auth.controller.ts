import { Request, Response } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await newUser.save();
    const { password, ...info } = newUser.toObject();

    res.status(200).send({ message: 'User Created Successfully', data: info });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'User Created Failed', error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log('user', user);

    if (!user) {
      return res.status(404).send({ message: 'Email does not exist' });
    }
    const comparedPassword = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!comparedPassword) {
      return res
        .status(404)
        .send({ message: 'Email Or Password incorrect' }) as any;
    }
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      }
    );
    const { password, ...info } = user.toObject();
    res
      .status(200)
      .send({ message: 'Login Successful', data: { info, token } });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Login Failed', error: error });
  }
};
