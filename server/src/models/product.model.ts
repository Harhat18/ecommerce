import mongoose from 'mongoose';

const { Schema } = mongoose;

const productModel = new Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    image: { type: String, required: true },
    categories: { type: Array, default: [] },
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('Product', productModel, 'product');
