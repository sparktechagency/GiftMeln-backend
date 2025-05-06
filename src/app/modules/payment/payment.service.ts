import { JwtPayload } from 'jsonwebtoken';
import { IPayment } from './payment.interface';
import { Subscription } from './payment.model';
import { stripe } from '../../../config/stripe';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const subscriptionDetailsFromDB = async (
  user: JwtPayload
): Promise<{ subscription: IPayment | {} }> => {
  const subscription = await Subscription.findOne({ user: user?.id })
    .populate('package').populate('user')
    .lean();
  // if not found any subscription for the user, return an empty object
  if (!subscription) {
    return { subscription: {} };
  }
  const subscriptionFromStripe = await stripe.subscriptions.retrieve(
    subscription?.subscriptionId
  );
  if (subscriptionFromStripe?.status !== 'active') {
    await Promise.all([
      User.findByIdAndUpdate(user.id, { isSubscribed: false }, { new: true }),
      Subscription.findOneAndUpdate(
        {
          user: user.id,
        },
        { status: 'expired' },
        { new: true }
      ),
    ]);
  }

  return { subscription };
};
//
const getAllSubscriptionIntoDB = async () => {
  const subscription = await Subscription.find().limit(20).populate({
    path: 'package',
    select: 'name  duration',
  }).populate({
    path: 'user',
    select: 'name email phone image',
  });
  if (!subscription.length) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Can't Find any Subscription");
  }
  return subscription;
};

// get all subscription history base this user
const getSubscriptionHistory = async (user: JwtPayload) => {
  const subscription = await Subscription.find({ user: user.id }).populate({
    path: 'package',
    model: 'package',
  });
  if (!subscription) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Can't Find any Subscription");
  }
  return subscription;
};

const editPriceByAdminFromDB = async (userId: string, newAmount: number) => {
    const subscription = await Subscription.findOneAndUpdate(
      { user: userId },
      { $set: { amountPaid: newAmount } },
      { new: true }
    ).lean();
  
    if (!subscription) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Subscription not found for this user.");
    }
  
    return subscription;
  };
  

export const PaymentServices = {
  subscriptionDetailsFromDB,
  getAllSubscriptionIntoDB,
  getSubscriptionHistory,
  editPriceByAdminFromDB,
};
