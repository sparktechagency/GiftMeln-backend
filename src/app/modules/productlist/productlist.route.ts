import express from 'express';
import { ProductListController } from './productlist.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
// create
router.post('/', ProductListController.createProductListForDash);
// get all
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ProductListController.getProductsList,
);

export const ProductListRoutes = router;
