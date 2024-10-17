import { Request, Response } from 'express';
import { Order } from '../models/order.model';

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newOrder = new Order({ ...req.body });
    await newOrder.save();
    res.status(201).send({ message: 'Order Created Successfully', newOrder });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Order Created Failed', error });
  }
};

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res
      .status(200)
      .send({ message: 'Order Updated Successfully', updatedOrder });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: 'An Error Occurred while Updating Order!', error });
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Cart deleted Successfully' });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: 'An Error Occurred while deleting Cart!', error });
  }
};

export const getUserOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderItems = await Order.findOne({ userId: req.params.id });
    res.status(200).send({ orderItems });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderItems = await Order.find();

    res.status(200).send({ orderItems });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

export const getMonthlyIncome = async (
  req: Request,
  res: Response
): Promise<void> => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: '$createdAt' },
          sales: '$amount',
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: '$sales' },
        },
      },
    ]);
    res.status(200).send(income);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({
        message: 'An Error Occurred while Getting Monthly Income!',
        error,
      });
  }
};
