import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  await UserService.createUserToDB(userData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User created successfully',
    data: {},
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user!);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const image = getSingleFilePath(req.files, 'image');

  const data = {
    image,
    ...req.body,
  };
  const result = await UserService.updateProfileToDB(user!, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllAdminsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin users retrieved successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  getAllAdmins,
};
