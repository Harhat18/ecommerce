import jwt, { verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';

interface UserPayload {
  phoneNumber: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findOne({ phoneNumber: req.body.phoneNumber });

  const authHeader = req.headers['authorization'] as string | undefined;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || user?.token !== token) {
    res.status(401).send('Access Denied');
    return;
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);

    if (typeof verified !== 'string') {
      req.user = verified as UserPayload;
      next();
    } else {
      res.status(400).send('Invalid Token');
    }
  } catch (error) {
    console.log(error);
    res.status(400).send('Invalid Token');
  }
};
export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  verifyToken(req, res, () => {
    if (req.user?.isAdmin) {
      next();
    } else {
      res.status(403).send('User is not an Admin');
    }
  });
};
