import { Schema, model } from 'mongoose';
import { IProductList, ProductListModel } from './productlist.interface';

const productListSchema = new Schema<IProductList, ProductListModel>(
  {
    product: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      ],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ProductList = model<IProductList, ProductListModel>(
  'ProductList',
  productListSchema,
);
