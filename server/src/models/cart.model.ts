import mongoose from 'mongoose';

const { Schema } = mongoose;

const cartModel = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    product: [
      {
        productId: { type: String },
        quantity: { type: Number, default: 1 },
      },
    ],
    amount: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model('Cart', cartModel, 'cart');
