import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { CartModel, ICart } from './cart.interface';
import { Cart } from './cart.model';

// create cart service 
const createCartServiceIntoDB = async (payload: ICart) => {
    const cart = await Cart.create(payload);
    if (!cart) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create cart');
    }
    return cart;
};



// get all cart with product details
const getAllCart = async (userId: string) => {
    const cart = await Cart.find({ user: userId })
        .populate('variations.product')
        .populate('user');

    if (!cart.length) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'No cart found for this user');
    }

    return cart;
};




export const CartServices = {
    createCartServiceIntoDB,
    getAllCart,
};
