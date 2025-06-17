import { Request, Response } from 'express';
import { ProductListServices } from './productlist.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
const createProductListForDash = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductListServices.getAllProductListForDashboard(
      req.query,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Product list fetched successfully',
      data: result.data,
    });
  },
);

const getProductsList = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductListServices.getAllProductListForDashboard(
    req.query,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product list fetched successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

export const ProductListController = {
  createProductListForDash,
  getProductsList,
};
