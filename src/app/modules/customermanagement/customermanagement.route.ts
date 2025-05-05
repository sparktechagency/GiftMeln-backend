import express from 'express';
import { CustomerManagementController } from './customermanagement.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  CustomerManagementController.getAllUser
);
// edit user details
router.patch(
    '/:id',
    fileUploadHandler() as any,
    async (req, res, next) => {
      const payload = req.body;
      const profileImage = getSingleFilePath(req.files, 'image');

  
      req.body = {
        image: profileImage,
        ...payload,
      };
  
      next();
    },
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    CustomerManagementController.editUserDetails
  );
  
router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  CustomerManagementController.getSingleUser
);

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  CustomerManagementController.deleteCustomer
);



// subscription amount how much have in his account
router.get(
  '/subscription/:id',
  auth(USER_ROLES.SUPER_ADMIN),
  CustomerManagementController.getSubscriptionPlan
);

export const CustomerManagementRoutes = router;
