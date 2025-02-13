import { StatusCodes } from "http-status-codes";
import { User } from "../app/modules/user/user.model";
import ApiError from "../errors/ApiError";
import { Package } from "../app/modules/package/package.model";
import { ObjectId } from "mongoose";
import Stripe from "stripe";
import { stripe } from "../config/stripe";
import { Payment } from "../app/modules/payment/payment.model";

// Helper function to find and validate the user
const getUserByEmail = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
};

// Helper function to find and validate the package (pricing plan)
const getPackageByProductId = async (productId: string) => {
    console.log("Fetching package with productId:", productId);
    const plan = await Package.findOne({ productId });
    if (!plan) {
        throw new ApiError(StatusCodes.NOT_FOUND, `Plan not found for productId: ${productId}`);
    }
    return plan;
};

// Helper function to create new subscription
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
    const isExistSubscription = await Payment.findOne({ user: user });
    if (isExistSubscription) {
        const payload = {
            customerId,
            price: amountPaid,
            user,
            package: packageId,
            trxId,
            subscriptionId,
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
        };
        await Payment.findByIdAndUpdate({ _id: isExistSubscription._id }, payload, { new: true });
    } else {
        const newSubscription = new Payment({
            customerId,
            price: amountPaid,
            user,
            package: packageId,
            trxId,
            subscriptionId,
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
        });
        await newSubscription.save();
    }
};

// Handle the subscription created event
export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(data.id);
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        const productId = subscription.items.data[0]?.price?.product as string;
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);

        const trxId = invoice.payment_intent as string;
        const amountPaid = (invoice.total || 0) / 100; // Convert to USD

        const user: any = await getUserByEmail(customer.email as string);
        const packageID: any = await getPackageByProductId(productId);

        if (!packageID) {
            console.error("Package not found for productId:", productId);
            throw new ApiError(StatusCodes.NOT_FOUND, "Package not found for productId: " + productId);
        }

        const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

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

        await User.findByIdAndUpdate(
            { _id: user._id },
            { isSubscribed: true },
            { new: true }
        );

        // Send notifications to user (implementation depends on how you notify users)
    } catch (error) {
        console.log("Error handling subscription creation:", error);
        throw error;
    }
};
