import { Request, Response } from 'express';

const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const stripe = async (req: Request, res: Response): Promise<void> => {
  Stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: req.body.amount,
      currency: 'usd',
    },
    (err: any, res: any) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.status(200).json(res);
      }
    }
  );
};
