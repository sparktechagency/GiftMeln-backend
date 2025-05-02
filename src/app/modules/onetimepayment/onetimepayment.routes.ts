import express from 'express';
import { OnetimepaymentController } from './onetimepayment.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get('/', auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), OnetimepaymentController.purchaseData);



export const OneTimePaymentRoutes = router;
