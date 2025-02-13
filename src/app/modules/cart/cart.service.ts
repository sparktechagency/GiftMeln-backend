import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { CartModel, ICart } from './cart.interface';
import { Cart } from './cart.model';

// create cart service 
const createCartServiceIntoDB = async (payload: ICart) => {
    const cart = await Cart.create(payload)
    if (!cart) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create cart');
    }
    return cart;
};



// get all cart with product details
const getAllCart = async () => { // Remove payload, it's not needed
    const cart = await Cart.find().populate('product').populate('user');
    if (!cart.length) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'No carts found');
    }
    return cart;
};

// get single cart
const getSingleCart = async (id: string) => {
    const cart = await Cart.findById(id).populate('product').populate('user');
    if (!cart) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
    }
    return cart;
};


export const CartServices = {
    createCartServiceIntoDB,
    getAllCart,
    getSingleCart
};
