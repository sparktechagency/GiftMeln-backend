import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Subscription } from '../payment/payment.model';
import { OneTimePayment } from './onetimepayment.model';
import { IOnetimePayment } from './onetimepayment.interface';
import { Cart } from '../cart/cart.model';
import mongoose from 'mongoose';
import { Types } from 'mongoose';

const getAllProductPurchaseDataIntoDB = async () => {
  const result = await OneTimePayment.find();
  if (result.length === 0) {
    return [];
  }
  return result;
};

// TODO: checkout product base on subscription balance
const checkoutProduct = async (data: any, user: any) => {
  const userId = user.authId || user.id;
  const userSubscription = await Subscription.findOne({ user: userId });
  if (!userSubscription) {
    throw new Error('Subscription not found for user');
  }
  const totalProductCost = data.products.reduce((sum: number, product: any) => {
    return sum + product.price * product.quantity;
  }, 0);

  // * balance check
  if (userSubscription.balance! < totalProductCost) {
    throw new Error('Insufficient balance in subscription');
  }
  userSubscription.balance! -= totalProductCost;
  await userSubscription.save();
  const payment = await OneTimePayment.create({
    user: userId,
    amountPaid: totalProductCost,
    status: data.status || 'completed',
    userName: data.orderDetails.userName,
    userEmail: data.orderDetails.userEmail,
    country: data.orderDetails.country,
    city: data.orderDetails.city,
    streetAddress: data.orderDetails.streetAddress,
    postCode: data.orderDetails.postCode,
    orderMessage: data.orderDetails.orderMessage || '',

    products: data.products.map((p: any) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      color: p.color || '',
      size: p.size || '',
    })),

    checkoutSessionId: '',
    paymentUrl: '',
  });
  await Cart.deleteMany({ user: new Types.ObjectId(userId) });
  return payment;
};

export const OnetimePaymentServices = {
  getAllProductPurchaseDataIntoDB,
  checkoutProduct,
};
