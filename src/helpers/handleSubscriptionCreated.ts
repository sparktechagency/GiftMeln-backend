import { StatusCodes } from 'http-status-codes';
import { User } from '../app/modules/user/user.model';
import ApiError from '../errors/ApiError';
import { Package } from '../app/modules/package/package.model';
import Stripe from 'stripe';
import { Subscription } from '../app/modules/payment/payment.model';
import { stripe } from '../config/stripe';
import { IPayment } from '../app/modules/payment/payment.interface';

/**
 * Helper to find a user by email.
 * Throws an error if the user is not found.
 */
const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Handles the Stripe subscription creation event.
 */
export const handleSubscriptionCreated = async (
  subscription: Stripe.Subscription,
) => {
  try {
    const fullSubscription = await stripe.subscriptions.retrieve(subscription.id);

    const billingCycleAnchor = new Date(fullSubscription.billing_cycle_anchor * 1000);
    // @ts-ignore
    const planInterval = fullSubscription?.plan?.interval;
    let currentPeriodEnd;

    if (planInterval === 'month') {
      currentPeriodEnd = new Date(billingCycleAnchor);
      currentPeriodEnd.setMonth(billingCycleAnchor.getMonth() + 1);
    } else if (planInterval === 'year') {
      currentPeriodEnd = new Date(billingCycleAnchor);
      currentPeriodEnd.setFullYear(billingCycleAnchor.getFullYear() + 1);
    } else {
      console.warn('Unsupported interval type:', planInterval);
    }

    const currentPeriodStart = billingCycleAnchor;

    const productId = fullSubscription?.items?.data[0]?.price?.product as string;
    if (!productId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Product ID not found in subscription',
      );
    }

    const invoice = await stripe.invoices.retrieve(fullSubscription?.latest_invoice as string);
    const trxId = invoice.payment_intent as string;
    const amountPaid = (invoice.total || 0) / 100;
    // @ts-ignore
    let email = fullSubscription?.customer_email;
    if (!email) {
      const customer = await stripe.customers.retrieve(fullSubscription?.customer as string);
      // @ts-ignore
      email = customer.email;
    }

    if (!email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Email not found in subscription data',
      );
    }

    const user = await getUserByEmail(email);

    const plan = await Package.findOne({ productId });
    if (!plan) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Plan not found for productId: ${productId}`,
      );
    }

    const subscriptionData: IPayment = {
      user: user.id || user.authId,
      customerId: fullSubscription?.customer as string,
      package: plan._id,
      trxId,
      subscriptionId: fullSubscription?.id as string,
      currentPeriodStart,
      // @ts-ignore
      currentPeriodEnd,
      amountPaid,
      balance: Number(amountPaid) / 2 + plan?.addGiftBalance!,
      status: 'active',
      paymentType: 'subscription',
    };

    const existingSubscription = await Subscription.findOne({ user: user.id || user.authId });
    let result;

    if (existingSubscription) {
      result = await Subscription.findByIdAndUpdate(
        existingSubscription._id,
        subscriptionData,
        { new: true },
      );
    } else {
      result = await Subscription.create(subscriptionData);
    }

    await User.findOneAndUpdate(
      { email },
      { isSubscribed: true },
      { new: true },
    );

    return true;
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error);
  }
};