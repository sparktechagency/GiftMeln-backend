// src/helpers/handleSubscriptionCreated.ts
import { StatusCodes } from "http-status-codes";
import { User } from "../app/modules/user/user.model";
import ApiError from "../errors/ApiError";
import { Package } from "../app/modules/package/package.model";
import { ObjectId } from "mongoose";
import Stripe from "stripe";
import { stripe } from "../config/stripe";
import { Payment } from "../app/modules/payment/payment.model";

/**
 * Helper to find a user by email.
 * Throws an error if the user is not found.
 */

const getUserByEmail = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
};

/**
 * Helper to find a package (pricing plan) by productId.
 * Throws an error if no matching package is found.
 */
const getPackageByProductId = async (productId: string) => {
    const plan = await Package.findOne({ productId });
    if (!plan) {
        throw new ApiError(StatusCodes.NOT_FOUND, `Plan not found for productId: ${productId}`);
    }
    return plan;
};

/**
 * Creates or updates a subscription record in the Payment collection.
 */
const createNewSubscription = async (
    user: ObjectId,
    customerId: string,
    packageId: ObjectId,
    amountPaid: number,
    trxId: string,
    subscriptionId: string,
    currentPeriodStart: string,
    currentPeriodEnd: string
) => {
    // Create the payload using the field names expected by your schema
    const payload = {
        customerId,
        amountPaid,
        user,
        package: packageId,
        trxId,
        subscriptionId,
        paymentType: "subscription",
        status: "success",
        currentPeriodStart,
        currentPeriodEnd,
    };

    // Check if a subscription for the user already exists.
    const isExistSubscription = await Payment.findOne({ user: user });
    if (isExistSubscription) {
        console.log(isExistSubscription);
        await Payment.findByIdAndUpdate({ _id: isExistSubscription._id }, payload, { new: true });
    } else {
        const newSubscription = new Payment(payload);
        const data = await newSubscription.save();
        console.log(data);
    }
};

/**
 * Handles the Stripe subscription creation event.
 * Retrieves all necessary details from Stripe, validates the user and plan,
 * then creates or updates a subscription record and marks the user as subscribed.
 */
export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(data.id);
        const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer;
        const productId = subscription.items.data[0]?.price?.product as string;
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
        const trxId = invoice.payment_intent as string;
        const amountPaid = (invoice.total || 0) / 100;

        const user = await getUserByEmail(customer.email as string);
        const plan = await getPackageByProductId(productId);

        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        const subscriptionData = {
            user: user._id,
            customerId: customer.id,
            package: plan._id,
            trxId,
            subscriptionId: subscription.id,
            currentPeriodStart,
            currentPeriodEnd,
            amountPaid,
            status: "active" as "active",
            paymentType: "subscription" as "subscription",
        };

        // Check if a subscription already exists for the user and update or create accordingly.
        const existingSubscription = await Payment.findOne({ user: user._id });
        if (existingSubscription) {
            await Payment.findByIdAndUpdate(existingSubscription._id, subscriptionData, { new: true });
        } else {
            const newSubscription = new Payment(subscriptionData);
            await newSubscription.save();
        }

        await User.findByIdAndUpdate(user._id, { isSubscribed: true }, { new: true });
    } catch (error) {
        console.error("Error handling subscription creation:", error);
        throw error;
    }
};