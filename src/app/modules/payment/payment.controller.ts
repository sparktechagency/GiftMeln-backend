import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentServices } from './payment.service';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

const subscriptionDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.subscriptionDetailsFromDB(req.user!);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription Details Retrieved Successfully',
    data: result.subscription,
  });
});

// get all subscription
const allSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.params.userId || req?.user?.authId;

  // if (!userId) {
  //   throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid User');
  // }

  const result = await PaymentServices.getAllSubscriptionIntoDB(userId);
  sendResponse(res, {
    success: true,
    Total: result.length,
    statusCode: StatusCodes.OK,
    message: 'Subscriptions fetched successfully',
    data: result,
  });
});

// get all subscription history base this user
const getSubscriptionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentServices.getSubscriptionHistory(req.user!);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Subscription history retrieved successfully.',
      data: result,
    });
  },
);

const editPriceByAdmin = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { amountPaid } = req.body;

  const result = await PaymentServices.editPriceByAdminFromDB(
    userId,
    amountPaid,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscription price updated successfully.',
    data: result,
  });
});

const overviewData = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.overViewFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Retrieve data successfully',
    data: result,
  });
});

const getRevenueAnalyticsFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentServices.getRevenueAnalytics(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Retrieve ${req.query.type} Data successfully`,
      data: result,
    });
  },
);

// active user
const totalActiveUser = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.activeUserFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Retrieve All Active user successfully`,
    data: { result },
  });
});
const exportRevenueCSV = catchAsync(async (req: Request, res: Response) => {
  await PaymentServices.exportRevenueCSVIndoDB(req.query, res);
});

const exportActiveUserCSV = catchAsync(async (req: Request, res: Response) => {
  await PaymentServices.exportAllSubscriberCSVIndoDB(res);
});

// TODO: Total active user and inactive user

const totalActiveUserAndInactiveUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentServices.getActiveAndInactiveUserFromDB();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Retrieved active and inactive user counts successfully`,
      data: result,
    });
  },
);

export const PaymentController = {
  subscriptionDetails,
  allSubscription,
  getSubscriptionHistory,
  editPriceByAdmin,
  overviewData,
  getRevenueAnalyticsFromDB,
  totalActiveUser,
  exportRevenueCSV,
  exportActiveUserCSV,
  totalActiveUserAndInactiveUser,
};
