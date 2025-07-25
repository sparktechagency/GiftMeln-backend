import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { IUser } from '../user/user.interface';

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { ...verifyData } = req.body;
  const result = await AuthService.verifyEmailToDB(verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUserFromDB(loginData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: {
      createToken: result.token,
      role: result.user.role,
    },
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  const result = await AuthService.forgetPasswordToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message:
      'Please check your email. We have sent you a one-time passcode (OTP).',
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { ...resetData } = req.body;
  const result = await AuthService.resetPasswordToDB(token!, resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully reset.',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;
  await AuthService.changePasswordToDB(user, passwordData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully changed',
  });
});

// ban user from admin
// const  banUser =
// add admin from admin dashboard
const addAdmin = catchAsync(async (req: Request, res: Response) => {
  const { ...adminData } = req.body;
  const result = await AuthService.addAdminIntoDB(adminData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Admin added successfully',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedAdmin = await AuthService.deleteAdminFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Successfully Delete Admin',
    data: deletedAdmin,
  });
});

const banUserIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AuthService.banUser(id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User has been successfully banned',
    data: result,
  });
});

const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.adminLoginWithTwoFactor(email, password);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Please check your email for verification code',
    data: result,
  });
});

const googleAuthCallback = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.handleGoogleLogin(
    req.user as IUser & { profile: any },
  );
  res.redirect(
    `https://giftmein.com/dashboard/surveys/?token=${result?.tokens?.accessToken}`,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Login successful',
    data: {
      createToken: result?.token,
      role: result?.user?.role,
    },
  });
});

export const AuthController = {
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
  addAdmin,
  deleteAdmin,
  banUserIntoDB,
  loginAdmin,
  googleAuthCallback,
};
