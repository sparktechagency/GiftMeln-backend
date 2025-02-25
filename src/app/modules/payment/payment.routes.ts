import express from 'express';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.get('/', PaymentController.allSubscription);
// product history
// router.get("/product", PaymentController.subscriptionDetails)
router.get("/")
export const PaymentRoutes = router;
