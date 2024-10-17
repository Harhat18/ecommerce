import { Request, Response } from 'express';
import { Product } from '../models/product.model';

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = req.body.categories
      ? req.body.categories.split(',')
      : [];
    const image = req.file?.path || '';
    const newProduct = new Product({ ...req.body, image, categories });
    await newProduct.save();
    res
      .status(200)
      .send({ message: 'Product Created Successfully', newProduct });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: 'An Error Occurred while Creating the Product', error });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res
      .status(200)
      .send({ message: 'Product Updated Successfully', updatedProduct });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: 'An Error Occurred while Updating Product!', error });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Product deleted Successfully' });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: 'An Error Occurred while deleting Product!', error });
  }
};

export const getProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).send({ product });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const qlatest = req.query.latest;
    const qcategory = req.query.category;

    let products;

    if (qlatest) {
      products = await Product.find().sort({ createdAt: -1 }).limit(3);
    } else if (qcategory) {
      products = await Product.find({
        categories: {
          $in: [qcategory],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).send({ products });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};
