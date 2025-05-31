import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PaymentController.allSubscription,
);

// * Over view page
router.get(
  '/overview',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PaymentController.overviewData,
);

// product history
// router.get("/product", PaymentController.subscriptionDetails)
// get user base subscription history
router.get(
  '/subscription-history',
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PaymentController.getSubscriptionHistory,
);

//
router.get(
  '/revenue',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PaymentController.getRevenueAnalyticsFromDB,
);

// active user
router.get(
  '/active-user',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),
  PaymentController.totalActiveUser,
);

router.patch(
  '/edit-price/:userId',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PaymentController.editPriceByAdmin,
);

export const PaymentRoutes = router;
