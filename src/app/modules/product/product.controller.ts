import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { productService } from './product.service';
import ApiError from '../../../errors/ApiError';
import { Request, Response } from 'express';

const createProduct = catchAsync(async (req, res) => {
  const result = await productService.createProductIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product created successfully',
    data: result,
  });
});

// get all products
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await productService.getAllProducts(filters);
  sendResponse(res, {
    Total: result?.length,
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All products retrieved successfully',
    data: result,
  });
});

// get single one
const getSingleProduct = catchAsync(async (req, res) => {
  const productId = req.params.id;
  const result = await productService.getSingleProduct(productId);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  const { product, relatedProducts } = result;

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single product retrieved successfully',
    data: {
      ...(product?.toObject ? product.toObject() : product),
      relatedProducts,
    },
  });
});

// update product
const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params; // Product ID
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const updatedData = req.body;

  // Delegate advanced logic to the service layer
  const updatedProduct = await productService.updateProductInDB(
    id,
    updatedData,
    files,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product updated successfully',
    data: updatedProduct,
  });
});

// delete
const deleteProduct = catchAsync(async (req, res) => {
  const productData = req.params.id;
  const result = await productService.deleteProductFromDB(productData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product deleted successfully',
    data: result,
  });
});

// shopify

const shopifyProduct = catchAsync(async (req, res) => {
  const result = await productService.shopifyProductFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Shopify product retrieved successfully',
    data: result.products,
  });
});

const getSingleShopifyProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.getSingleProductFromShopify(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single product fetched from Shopify',
    data: result,
  });
});

const createBulkProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.createBulkProductToDB(req.body.people);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company Created Successfully',
    data: result,
  });
});

export const productController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  // shopify
  shopifyProduct,
  getSingleShopifyProduct,
  createBulkProduct,
};
