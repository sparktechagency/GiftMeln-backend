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



// !get all cart with product details 
///maybe next time change it if it's not work
const getAllCart = async (userId: string) => {
    const cart = await Cart.find({ user: userId })
        .populate('variations.product')
        .populate('user');

    if (!cart.length) {
        return []
    }

    // Calculate total price
    const totalPrice = cart.reduce((sum, item) => {
        const quantity = item.variations.quantity;
        const price = item?.variations?.product && typeof item.variations.product === 'object' ? (item.variations.product as any).discountedPrice : 0;
        return sum + (quantity * price);
    }, 0);

    // Calculate total items
    const totalItems = cart.reduce((sum, item) => sum + item.variations.quantity, 0);

    return {
        success: true,
        Total: cart.length,
        totalItems,
        totalPrice,
        message: "User cart items retrieved successfully",
        data: cart
    };
};



// update quantity 
const updateQuantity = async (userId: string, cartItemId: string, quantity: number) => {
    const cart = await Cart.findOneAndUpdate(
        { user: userId, _id: cartItemId },
        { $set: { "variations.quantity": quantity } },
        { new: true }
    );

    if (!cart) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Cart item not found');
    }

    return cart;
};


// delete cart item's
const deleteCartItem = async (userId: any, cartItemId: any) => {
    if (!cartItemId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart item ID is required');
    }

    const cart = await Cart.findOneAndDelete({ user: userId, _id: cartItemId });

    if (!cart) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Cart item not found');
    }

    return { message: 'Cart item deleted successfully' };
};

const clearCart = async (userId: string) => {
    try {
        const cartItems = await Cart.find({ user: userId });

        if (!cartItems.length) {
            return { success: false, message: "No cart items to delete" };
        }

        const deletedItems = await Cart.deleteMany({ user: userId });


        return {
            success: true,
            message: "All cart items cleared successfully",
            deletedCount: deletedItems.deletedCount,
            deletedItems: cartItems,
        };
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to clear cart");
    }
};







export const CartServices = {
    createCartServiceIntoDB,
    getAllCart,
    updateQuantity,
    deleteCartItem,
    clearCart
};
