import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Cart } from './cart.model';
import { ICart } from './cart.interface';
import { Subscription } from '../payment/payment.model';

// create cart service
const createCartServiceIntoDB = async (userId: string, payload: ICart) => {
  const cart = await Cart.create(payload);
  if (!cart) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create cart');
  }
  return cart;
};

// !get all cart with product details
///maybe next time change it if it's not work
const getAllCart = async (id: string) => {
  const cart = await Cart.find({ user: id })
    .populate('user')
    .populate('variations.product');

  if (!cart.length) {
    return {
      success: true,
      message: 'No cart items found',
      data: [],
      totalCarts: 0,
      totalItems: 0,
      totalPrice: 0,
    };
  }

  let totalPrice = 0;
  let totalItems = 0;

  cart.forEach(item => {
    const variations = Array.isArray(item.variations)
      ? item.variations
      : [item.variations];

    variations.forEach(variation => {
      if (
        variation.product &&
        variation.product.discountedPrice &&
        variation.quantity
      ) {
        totalPrice += variation.product.discountedPrice * variation.quantity;
        totalItems += variation.quantity;
      }
    });
  });

  return {
    success: true,
    message: 'User cart items retrieved successfully',
    totalCarts: cart.length,
    totalItems,
    totalPrice,
    data: cart,
  };
};

// update quantity

const updateQuantity = async (
  cartId: string,
  variationId: string,
  quantity: number,
) => {
  const result = await Cart.findOneAndUpdate(
    { _id: cartId, 'variations._id': variationId },
    { $set: { 'variations.$.quantity': quantity } },
    { new: true },
  )
    .populate('user')
    .populate('variations.product');

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Cart item or variation not found',
    );
  }

  return result;
};

// delete cart item's
const deleteCartItem = async (userId: any, id: string) => {
  const result = await Cart.findOneAndDelete({ user: userId, _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart item not found');
  }
  return { message: 'Cart item deleted successfully' };
};

const clearCart = async (userId: string) => {
  try {
    const cartItems = await Cart.find({ user: userId });

    if (!cartItems.length) {
      return { success: false, message: 'No cart items to delete' };
    }

    const deletedItems = await Cart.deleteMany({ user: userId });

    return {
      success: true,
      message: 'All cart items cleared successfully',
      deletedCount: deletedItems.deletedCount,
      deletedItems: cartItems,
    };
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to clear cart',
    );
  }
};

// TODO: need to remove money from subscription base on cart total price
const parchesBaseOnSubscriptionPrice = async (
  userId: string,
  totalPrice: number,
) => {
  const result = await Subscription.findOne({ user: userId });
  if (result) {
    result.balance = result.balance! - totalPrice;
    await result.save();
  }
  return result;
};

export const CartServices = {
  createCartServiceIntoDB,
  getAllCart,
  updateQuantity,
  deleteCartItem,
  clearCart,
  parchesBaseOnSubscriptionPrice,
};
