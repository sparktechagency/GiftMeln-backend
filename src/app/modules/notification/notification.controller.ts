import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { NotificationServices } from './notification.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
const createNotification = catchAsync(async (req: Request, res: Response) => {
  const notification = req.body;
  const result = await NotificationServices.createNotification(notification);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Notification created successfully',
    data: result,
  });
});

const getNotificationsByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const notifications = await NotificationServices.getNotificationsByUserId(
      userId
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notifications fetched successfully',
      data: notifications,
    });
  }
);

const updateNotification = catchAsync(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  const userId = req.user?.id;

  const result = await NotificationServices.updateNotification(
    notificationId,
    userId.toString()
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

const getAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationServices.getAllNotificationsIntoDB(
    req.query, 
    req.user
  );

  sendResponse(res, {
    statusCode:StatusCodes.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    meta: result.meta,
    // @ts-ignore
    data: result.data,
  });
});

export const NotificationController = {
  createNotification,
  getNotificationsByUserId,
  updateNotification,
  getAllNotifications,
};
