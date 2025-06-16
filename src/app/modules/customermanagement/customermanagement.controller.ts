import { Request, Response, NextFunction } from 'express';
import { CustomerManagementServices } from './customermanagement.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

// view all customer
const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await CustomerManagementServices.getAllUserFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User fetched successfully',
    data: result,
  });
});

// delete customer

const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerManagementServices.deleteCustomerFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

// get single one
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerManagementServices.getSingleUserFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User fetched successfully',
    data: result,
  });
});
// get user subscription plan how much have amount in his account
const getSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerManagementServices.getSubscriptionPlanFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User fetched successfully',
    data: result,
  });
});

// edit user details
const editUserDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerManagementServices.editUserDetailsFromDB(
    id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User updated successfully',
    data: result,
  });
});

export const CustomerManagementController = {
  getAllUser,
  deleteCustomer,
  getSingleUser,
  getSubscriptionPlan,
  editUserDetails,
};
