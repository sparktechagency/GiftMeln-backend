import { Request, Response, NextFunction } from 'express';
import { FaqServices } from './faq.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
const createFaq = catchAsync(async (req: Request, res: Response) => {
  const { ...faqData } = req.body;
  const result = await FaqServices.createFAQIntoDB(faqData);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Faq created successfully',
    data: result,
  });
});
const getAllFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqServices.getAllFAQFromDB();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Faq fetched successfully',
    data: result,
  });
});
const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FaqServices.updateFaqFromDB(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Faq updated successfully',
    data: result,
  });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FaqServices.deleteFaqFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Faq deleted successfully',
    data: result,
  });
});

export const FaqController = {
  createFaq,
  getAllFaq,
  updateFaq,
  deleteFaq,
};
