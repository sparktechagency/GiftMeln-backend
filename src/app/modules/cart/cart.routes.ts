import express from 'express';
import { CartController } from './cart.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post('/create', CartController.createCart);
router.get('/', auth(USER_ROLES.USER), CartController.getAllCartItems);
router.put("/:id", auth(USER_ROLES.USER), CartController.updateCartItemsQuantity)

export const CartRoutes = router;
