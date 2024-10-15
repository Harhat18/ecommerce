import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: User; // Make user optional or required based on your use case
    }
  }
}
