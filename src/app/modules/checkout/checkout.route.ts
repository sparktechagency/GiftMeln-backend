import express from 'express';
import { CheckoutController } from './checkout.controller';

const router = express.Router();

router.get('/', CheckoutController); 

export const CheckoutRoutes = router;
