import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get('/', PaymentController.allSubscription);
// product history
// router.get("/product", PaymentController.subscriptionDetails)
// get user base subscription history
router.get("/subscription-history", auth(USER_ROLES.USER), PaymentController.getSubscriptionHistory)
export const PaymentRoutes = router;
