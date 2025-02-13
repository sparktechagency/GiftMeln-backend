import express from 'express';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.get('/', PaymentController); 

export const PaymentRoutes = router;
