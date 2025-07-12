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
    // Retrieve full subscription data
    const fullSubscription = await stripe.subscriptions.retrieve(
      subscription.id,
    );

    // Get productId from subscription
    const productId = fullSubscription.items.data[0]?.price?.product as string;
    if (!productId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Product ID not found in subscription',
      );
    }

    // Get the invoice to retrieve payment details
    const invoice = await stripe.invoices.retrieve(
      fullSubscription.latest_invoice as string,
    );
    const trxId = invoice.payment_intent as string;
    const amountPaid = (invoice.total || 0) / 100;
    // const balance =
    // Get email from the subscription or customer
    // @ts-ignore
    let email = fullSubscription.customer_email;
    if (!email) {
      // const customer = await stripe.customers.retrieve(fullSubscription.customer as string);
      // //@ts-nocheck
      // email = customer.email;
      // @ts-ignore
      const customer = await stripe.customers.retrieve(
        fullSubscription?.customer,
      );
      // @ts-ignore
      email = customer.email;
    }

    if (!email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Email not found in subscription data',
      );
    }

    // Retrieve user by email
    const user = await getUserByEmail(email);

    // Find the plan (package) associated with the productId
    const plan = await Package.findOne({ productId });
    if (!plan) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Plan not found for productId: ${productId}`,
      );
    }

    // Format the current period start and end dates
    const currentPeriodStart = new Date(
      fullSubscription.current_period_start * 1000,
    );
    const currentPeriodEnd = new Date(
      fullSubscription.current_period_end * 1000,
    );

    // Prepare subscription data according to IPayment interface
    const subscriptionData: IPayment = {
      user: user._id,
      customerId: fullSubscription.customer as string,
      package: plan._id,
      trxId,
      subscriptionId: fullSubscription.id,
      currentPeriodStart,
      currentPeriodEnd,
      amountPaid,
      balance: Number(amountPaid) / 2 + plan?.addGiftBalance!,
      status: 'active',
      paymentType: 'subscription',
    };

    // Check if subscription already exists for this user
    const existingSubscription = await Subscription.findOne({ user: user._id });
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

    // Update the user's subscription status
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
