import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IProduct } from './product.interface';
import { ProductModel } from './product.model';
import mongoose from 'mongoose';
import config from '../../../config';
import axios from 'axios';
const baseURL = `https://${config.shopify.storeDomain}/admin/api/${config.shopify.apiVersion}`;
const createProductIntoDB = async (productData: IProduct) => {
  const product = await ProductModel.create(productData);
  if (!product) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create product');
  }
  return product;
};

// get all products

const getAllProducts = async (filters: any) => {
  try {
    const query: any = {};

    if (filters?.categoryName) {
      query['productCategory.categoryName'] = {
        $regex: new RegExp(filters.categoryName, 'i'),
      };
    }

    if (filters?.categoryId) {
      if (Array.isArray(filters.categoryId)) {
        query['productCategory._id'] = {
          $in: filters.categoryId.map(
            (id: string) => new mongoose.Types.ObjectId(id)
          ),
        };
      } else {
        query['productCategory._id'] = new mongoose.Types.ObjectId(
          filters.categoryId
        );
      }
    }

    if (filters.availability) {
      query.availability = filters.availability;
    }

    // Handle price range filter based on discountedPrice
    if (filters.minPrice || filters.maxPrice) {
      query.discountedPrice = {}; // Apply the filter on discountedPrice instead of regularPrice
      if (filters.minPrice) {
        query.discountedPrice.$gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice) {
        query.discountedPrice.$lte = parseFloat(filters.maxPrice);
      }
    }

    // Run the query with the price filter and other filters
    const products = await ProductModel.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'productCategory',
          foreignField: '_id',
          as: 'productCategory',
        },
      },
      { $unwind: '$productCategory' },
      { $match: query },
    ]);

    // If no products found (including price not matching), return empty array
    if (!products || products.length === 0) {
      return [];
    }

    return products;
  } catch (error) {
    console.error('Error occurred:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'No product found');
  }
};

// get single product
const getSingleProduct = async (id: string) => {
  const product = await ProductModel.findById(id).populate('productCategory');
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  const relatedProducts = await ProductModel.find({
    productCategory: product.productCategory,
    _id: { $ne: id },
  }).limit(4);

  return { product, relatedProducts };
};

// update product
const updateProductInDB = async (
  productId: string,
  updatedData: Partial<IProduct>,
  files: { [fieldname: string]: Express.Multer.File[] }
) => {
  // Process files
  if (files.featureImage && files.featureImage.length > 0) {
    // @ts-ignore
    updatedData.featureImage = files.featureImage[0].path;
  }
  if (files.additionalImages && files.additionalImages.length > 0) {
    // @ts-ignore
    updatedData.additionalImages = files.additionalImages.map(
      file => file.path
    );
  }

  // Parse JSON fields if needed
  if (updatedData.tag) {
    try {
      updatedData.tag = JSON.parse(updatedData.tag as unknown as string);
    } catch (error) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Invalid JSON format for tags'
      );
    }
  }

  // Update the product in the database
  const product = await ProductModel.findByIdAndUpdate(productId, updatedData, {
    new: true, // Return the updated product
    runValidators: true, // Apply schema validators
  });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  return product;
};

// delete product
const deleteProductFromDB = async (id: string) => {
  const result = await ProductModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No Data Found');
  }
  return result;
};
// shopify all service
const shopifyProductFromDB = async () => {

  // 👇 Check if accessToken exists
  if (!config.shopify.accessToken) {
    throw new Error('Shopify Access Token missing!');
  }

  const res = await fetch(`${baseURL}/products.json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.shopify.accessToken,
    },
  });

  const data = await res.json();

  return data;
};

// get single product from shopify
const getSingleProductFromShopify = async (id: string) => {
  const res = await fetch(
    `https://${config.shopify.storeDomain}/admin/api/${config.shopify.apiVersion}/products/${id}.json`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': config.shopify.accessToken!,
      },
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Shopify error: ${error}`);
  }

  const data = await res.json();
  const shopifyProduct = data.product;
  // filter image (only one main image)
  const productData = {
    id: shopifyProduct.id,
    title: shopifyProduct.title,
    description: shopifyProduct.body_html,
    vendor: shopifyProduct.vendor,
    product_type: shopifyProduct.product_type,
    created_at: shopifyProduct.created_at,
    handle: shopifyProduct.handle,
    updated_at: shopifyProduct.updated_at,
    published_at: shopifyProduct.published_at,
    template_suffix: shopifyProduct.template_suffix,
    published_scope: shopifyProduct.published_scope,
    tags: shopifyProduct.tags,
    status: shopifyProduct.status,
    image: shopifyProduct.images?.[0]?.src || null, // optional chaining
    price: shopifyProduct.variants?.[0]?.price || '0.00',
    options: shopifyProduct.options,
    variants: shopifyProduct.variants,
  };

  // Set to cache

  return productData;
};

export const productService = {
  createProductIntoDB,
  getAllProducts,
  getSingleProduct,
  updateProductInDB,
  deleteProductFromDB,
  ///shopify
  shopifyProductFromDB,
  getSingleProductFromShopify,
};
