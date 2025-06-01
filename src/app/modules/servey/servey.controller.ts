import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { SurveyService } from './servey.service';
import sendResponse from '../../../shared/sendResponse';
import { Types } from 'mongoose';

const createSurvey = catchAsync(async (req: Request, res: Response) => {
  const result = req.body;
  const data = await SurveyService.createOrUpdateSurvey(result);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Survey created successfully',
    data: data,
  });
});

const updateSurvey = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Survey ID is required',
    });
  }

  const data = await SurveyService.updateSurveyIntoDB(id, updateData);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: 'Survey not found',
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Survey updated successfully',
    data: data,
  });
});

// get suer servery
const getAllSurveys = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.params.userId;

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'User ID is required',
      data: null,
    });
  }

  const data = await SurveyService.getAllSurveysFromDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Surveys fetched successfully',
    data: data,
  });
});

const getSingleSurvey = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SurveyService.getSingleSurvey(id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Survey fetched successfully',
    data: result,
  });
});

const getAllSurveysAllForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SurveyService.getAllSurveys();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Surveys fetched successfully',
      data: result,
    });
  },
);

export const SurveyController = {
  createSurvey,
  updateSurvey,
  getAllSurveys,
  getSingleSurvey,
  getAllSurveysAllForAdmin,
};
