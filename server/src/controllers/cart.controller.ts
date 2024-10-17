import { Request, Response } from 'express';
import { Cart } from '../models/cart.model';

export const createCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newCart = new Cart({ ...req.body });
    await newCart.save();
    res.status(201).send({ message: 'Cart Created Successfully', newCart });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Cart Created Failed', error });
  }
};

export const updateCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).send({ message: 'Cart Updated Successfully', updatedCart });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: 'An Error Occurred while Updating Cart!', error });
  }
};

export const deleteCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Cart deleted Successfully' });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: 'An Error Occurred while deleting Cart!', error });
  }
};

export const getUserCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cartItems = await Cart.findOne({ userId: req.params.id });
    res.status(200).send({ cartItems });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

export const getCartItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cartItems = await Cart.find();

    res.status(200).send({ cartItems });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};
