import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    // @@ts-ignore
    fileUploadHandler() as any,
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfile(req, res, next);
    }
  );

router
  .route('/register')
  .post(
    // validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );
router.get('/admins', auth(USER_ROLES.SUPER_ADMIN), UserController.getAllAdmins);
export const UserRoutes = router;
