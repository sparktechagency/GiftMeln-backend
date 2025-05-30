import express, { Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import passport from  "../../../config/passport"




const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  AuthController.googleAuthCallback
);


router.post(
  '/login',
  validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword
);

router.post(
  '/verify-email',
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);

router.post(
  '/change-password',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword
);

router.post(
  '/create-admin',
  auth(USER_ROLES.SUPER_ADMIN),
  AuthController.addAdmin
);

router.delete(
  '/delete-admin/:id',
  auth(USER_ROLES.SUPER_ADMIN),
  AuthController.deleteAdmin
);

router.patch(
  '/ban-user/:id',
  auth(USER_ROLES.SUPER_ADMIN),
  AuthController.banUserIntoDB
);



export const AuthRoutes = router;
