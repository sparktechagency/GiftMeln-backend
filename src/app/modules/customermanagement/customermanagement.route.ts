import express from 'express';
import { CustomermanagementController } from './customermanagement.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get('/', auth(USER_ROLES.SUPER_ADMIN), CustomermanagementController.getAllUser);
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN), CustomermanagementController.getSingleUser);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN), CustomermanagementController.deleteCustomer);

export const CustomermanagementRoutes = router;
