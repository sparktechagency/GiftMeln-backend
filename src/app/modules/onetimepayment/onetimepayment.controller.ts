import { Request, Response } from 'express';
import { OnetimePaymentServices } from './onetimepayment.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

const purchaseData = catchAsync(async (req: Request, res: Response) => {
  const result = await OnetimePaymentServices.getAllProductPurchaseDataIntoDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Purchase data fetched successfully',
    data: result,
  });
});

const checkoutProduct = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = req.body;
  const result = await OnetimePaymentServices.checkoutProduct(data, user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Purchase data fetched successfully',
    data: result,
  });
});

export const OnetimePaymentController = {
  purchaseData,
  checkoutProduct,
};
