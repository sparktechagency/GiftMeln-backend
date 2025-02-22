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
        amountPaid,             // use "amountPaid" instead of "price"
        user,
        package: packageId,
        trxId,
        subscriptionId,
        paymentType: "subscription", // provide a valid payment type
        status: "pending",      // set a status that is valid per your enum (adjust as needed)
        currentPeriodStart,
        currentPeriodEnd,
    };

    // Check if a subscription for the user already exists.
    const isExistSubscription = await Payment.findOne({ user: user });
    if (isExistSubscription) {
        await Payment.findByIdAndUpdate({ _id: isExistSubscription._id }, payload, { new: true });
    } else {
        const newSubscription = new Payment(payload);
        await newSubscription.save();
    }
};

/**
 * Handles the Stripe subscription creation event.
 * Retrieves all necessary details from Stripe, validates the user and plan,
 * then creates or updates a subscription record and marks the user as subscribed.
 */
export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
    try {
        // Fetch the latest subscription details from Stripe.
        const subscription = await stripe.subscriptions.retrieve(data.id);

        // Retrieve customer details.
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;

        // Extract product ID from the subscription items.
        const productId = subscription.items.data[0]?.price?.product as string;

        // Retrieve invoice details to determine payment info.
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);

        // Extract transaction and payment details.
        const trxId = invoice.payment_intent as string;
        const amountPaid = (invoice.total || 0) / 100; // Convert cents to USD

        // Validate and retrieve the user from your database.
        const user: any = await getUserByEmail(customer.email as string);

        // Validate and retrieve the package/plan for the product.
        const packageID: any = await getPackageByProductId(productId);

        // Convert subscription period timestamps to ISO string format.
        const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Create or update the subscription record in the Payment model.
        await createNewSubscription(
            user?._id,
            customer?.id,
            packageID?._id,
            amountPaid,
            trxId,
            subscription?.id,
            currentPeriodStart,
            currentPeriodEnd
        );

        // Update the user's record to indicate an active subscription.
        await User.findByIdAndUpdate(
            { _id: user._id },
            { isSubscribed: true },
            { new: true }
        );

        // Optionally, send notifications to the user here.
    } catch (error) {
        console.error("❌ Error handling subscription creation:", error);
        throw error;
    }
};
