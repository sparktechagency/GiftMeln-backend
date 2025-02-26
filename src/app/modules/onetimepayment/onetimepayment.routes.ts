import express from 'express';
import { OnetimepaymentController } from './onetimepayment.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get('/', auth(USER_ROLES.USER), OnetimepaymentController.purchaseData);



export const OnetimepaymentRoutes = router;
