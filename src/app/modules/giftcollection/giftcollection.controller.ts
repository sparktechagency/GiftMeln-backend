import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { GiftCollectionServices } from './giftcollection.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getAllGift = catchAsync(async (req: Request, res: Response) => {
  const result = await GiftCollectionServices.getAllGiftCollectionFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Gift collection retrieved successfully',
    data: result,
  });
});
const updateGift = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await GiftCollectionServices.updateGiftCollection(id, payload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Gift collection updated successfully',
    data: result,
  });
});

const allGift = catchAsync(async (req: Request, res: Response) => {
  const result = await GiftCollectionServices.getAllGiftFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Gift collection retrieved successfully',
    data: result,
  });
});

const deleteGift = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GiftCollectionServices.deleteGiftCollection(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Gift collection deleted successfully',
    data: result,
  });
});
export const GiftCollectionController = {
  getAllGift,
  updateGift,
  deleteGift,
  allGift,
};
