import express from 'express';
import { CustomerManagementController } from './customermanagement.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CustomerManagementController.getAllUser);
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CustomerManagementController.getSingleUser);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN), CustomerManagementController.deleteCustomer);


// subscription amount how much have in his account
router.get('/subscription/:id', auth(USER_ROLES.SUPER_ADMIN), CustomerManagementController.getSubscriptionPlan);

export const CustomerManagementRoutes = router;