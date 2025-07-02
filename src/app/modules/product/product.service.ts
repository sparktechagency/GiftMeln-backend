import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IProduct } from './product.interface';
import { ProductModel } from './product.model';
import config from '../../../config';
import QueryBuilder from '../../builder/QueryBuilder';
import { productParse } from './product.parse';
const baseURL = `https://${config.shopify.storeDomain}/admin/api/${config.shopify.apiVersion}`;

const createProductIntoDB = async (productData: IProduct) => {
  const product = await ProductModel.create(productData);
  if (!product) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create product');
  }
  return product;
};
const getAllProductsFromDB = async (query: Record<string, any>) => {
  const filters = { ...query };

  const discountedPriceFilter: any = {};

  if (filters.minPrice) {
    discountedPriceFilter.$gte = Number(filters.minPrice);
    delete filters.minPrice;
  }
  if (filters.maxPrice) {
    discountedPriceFilter.$lte = Number(filters.maxPrice);
    delete filters.maxPrice;
  }

  if (Object.keys(discountedPriceFilter).length > 0) {
    filters.discountedPrice = discountedPriceFilter;
  }

  const queryBuilder = new QueryBuilder(ProductModel.find(), filters)
    .search(['productName', 'description'])
    .filter()
    .sort()
    .paginate();

  const products = await queryBuilder.modelQuery;
  return products;
};
// update product from Database
const updateProductFromDB = async (id: string, payload: IProduct) => {
  const product = await ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  return product;
};

// get single product
const getSingleProduct = async (id: string) => {
  const product = await ProductModel.findById(id).populate('category');
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  const relatedProducts = await ProductModel.find({
    category: product.category,
    _id: { $ne: product._id },
    tag: { $in: product.tag },
  }).limit(4);

  return { product, relatedProducts };
};

// update product
const updateProductInDB = async (
  productId: string,
  updatedData: Partial<IProduct>,
  files: { [fieldname: string]: Express.Multer.File[] },
) => {
  // Process image uploads
  if (files.featureImage && files.featureImage.length > 0) {
    // @ts-ignore
    updatedData.featureImage = files.featureImage[0].path;
  }

  if (files.additionalImages && files.additionalImages.length > 0) {
    // @ts-ignore
    updatedData.additionalImages = files.additionalImages.map(
      file => file.path,
    );
  }

  // ✅ Properly parse stringified fields to arrays
  if (updatedData.tag) {
    try {
      updatedData.tag = JSON.parse(updatedData.tag as unknown as string);
    } catch {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Invalid JSON format for tags',
      );
    }
  }

  // ✅ Use helper for size and color
  updatedData.size = productParse(updatedData.size);
  updatedData.color = productParse(updatedData.color);

  // Update DB
  const product = await ProductModel.findByIdAndUpdate(productId, updatedData, {
    new: true,
    runValidators: true,
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
    },
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Shopify error: ${error}`);
  }

  const data = await res.json();
  const shopifyProduct = data.product;
  // Set to cache

  return shopifyProduct;
};
const createBulkProductToDB = async (
  payload: IProduct[],
): Promise<IProduct[]> => {
  const createProduct = await ProductModel.insertMany(payload);
  if (!createProduct)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to created Company');
  return createProduct;
};

export const productService = {
  createProductIntoDB,
  getAllProductsFromDB,
  getSingleProduct,
  updateProductInDB,
  deleteProductFromDB,
  ///shopify
  shopifyProductFromDB,
  getSingleProductFromShopify,
  createBulkProductToDB,
  updateProductFromDB,
};
