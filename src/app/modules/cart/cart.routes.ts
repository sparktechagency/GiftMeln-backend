import express from 'express';
import { CartController } from './cart.controller';

const router = express.Router();

router.post('/create', CartController.createCart);
router.get('/', CartController.getAllCartItems);
router.get('/:id', CartController.getSingleCart);

export const CartRoutes = router;
