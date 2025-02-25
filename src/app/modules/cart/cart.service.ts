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
        .populate({
            path: "variations.product",
            select: "discountedPrice productName featureImage",
        })
        .populate("user");

    if (!cart.length) {
        return {
            success: true,
            message: "No cart items found",
            data: [],
            totalCarts: 0,
            totalItems: 0,
            totalPrice: 0,
        };
    }

    let totalPrice = 0;
    let totalItems = 0;

    cart.forEach((item) => {
        const variations = Array.isArray(item.variations) ? item.variations : [item.variations];

        variations.forEach((variation) => {
            if (variation.product && Array.isArray(variation.product) && variation.product.length > 0) {
                const product = variation.product[0];



                if (product.discountedPrice && variation.quantity) {
                    totalPrice += product.discountedPrice * variation.quantity;
                    totalItems += variation.quantity;
                }
            }
        });
    });

    return {
        success: true,
        message: "User cart items retrieved successfully",
        totalCarts: cart.length,
        totalItems,
        totalPrice,
        data: cart,
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
