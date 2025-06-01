import { Request, Response } from 'express';
import { EventCategoryServices } from './eventcategory.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
const createEventCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await EventCategoryServices.createEventCategoryIntoDB(
    req.body,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Successfully create Event Category',
    data: result,
  });
});

const getAllEventCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await EventCategoryServices.getAllEventCategoryFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Retrieve Event Category',
    data: result,
  });
});
const getSingleEventCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EventCategoryServices.getSingleEventCategoryFromDB(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Retrieve Event Category',
      data: result,
    });
  },
);

const deleteSingleEventCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EventCategoryServices.deleteEventCategoryFromDB(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Delete Event Category',
      data: result,
    });
  },
);

const updateEventCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventCategoryServices.updateEventCategoryIntoDB(
    id,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Update Event Category',
    data: result,
  });
});

export const EventCategoryController = {
  createEventCategory,
  getAllEventCategory,
  getSingleEventCategory,
  deleteSingleEventCategory,
  updateEventCategory,
};
