import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import { createSubscriptionProductHelper } from '../../../helpers/createSubscriptionProductHelper';
import { User } from '../user/user.model';
import { stripe } from '../../../config/stripe';


const createPackageIntoDB = async (payload: IPackage) => {
    // Dynamically set the trialEndsAt based on the duration
    let trialEndsAt: Date | null = null;

    if (payload.duration === "7 days") {
        trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (payload.duration === "month") {
        trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (payload.duration === "year") {
        trialEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else {
        throw new Error("No trial period set for duration");
    }

    // Create the product on Stripe
    const product = await createSubscriptionProductHelper({
        name: payload.name,
        description: payload.description,
        duration: payload.duration,
        price: payload.price ?? 0,
    });

    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product");
    }

    // Create the package record in the database with dynamic trialEndsAt value
    const createdPackage = await Package.create({
        ...payload,
        productId: product.productId,
        stripePriceId: product.priceId,
        paymentLink: product.paymentLink,
        trialEndsAt,
    });

    if (!createdPackage) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Package creation failed");
    }

    return createdPackage;
};
/**
 * Check if a user's trial has expired
 */
const checkTrialStatus = async (userId: string) => {
    const userPackage = await Package.findOne({ userId });

    if (!userPackage) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No active subscription found");
    }

    if (userPackage.hasTrial && userPackage.trialEndsAt) {
        if (new Date() > new Date(userPackage.trialEndsAt)) {
            await Package.updateOne({ userId }, { $set: { hasTrial: false } });
            throw new ApiError(StatusCodes.FORBIDDEN, "Your free trial has expired. Please subscribe.");
        }
    }

    return userPackage;
};

/**
 * Start trial subscription
 */
const startTrialSubscription = async (userId: string, packageId: string, paymentMethodId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Package not found");
    }

    let customerId = user.stripeCustomerId;

    // ✅ Check if customer already exists in Stripe
    if (!customerId) {
        const existingCustomers = await stripe.customers.list({ email: user.email });

        if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id;
        } else {
            try {
                // ✅ Create new Stripe customer if not found
                const customer = await stripe.customers.create({ email: user.email });
                customerId = customer.id;
            } catch (error) {
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Stripe customer creation failed.");
            }
        }

        user.stripeCustomerId = customerId;
        await user.save();
    }

    // ✅ Attach payment method to customer
    try {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to attach payment method.");
    }

    await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId }
    });

    // ✅ Create a subscription with a 7-day free trial
    let subscription;
    try {
        subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: selectedPackage.stripePriceId }],
            trial_period_days: 7,
            expand: ["latest_invoice.payment_intent"],
        });

    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create subscription.");
    }

    // ✅ Save subscription details in database
    user.stripeSubscriptionId = subscription.id;
    user.subscriptionStatus = "trialing";
    user.trialEndsAt = new Date(subscription.trial_end * 1000);
    await user.save();

    return {
        message: "Subscription started with a 7-day trial",
        subscriptionId: subscription.id,
        trialEndsAt: user.trialEndsAt,
    };
};


// Get all available packages
const getAllPackages = async () => {
    const packages = await Package.find({});
    if (!packages) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No packages found");
    }
    return packages;
};

// Get package by ID
const getPackageById = async (packageId: string) => {
    const packageData = await Package.findById(packageId)
    if (!packageData) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Package not found");
    }
    return packageData;
}
const subscribeToPackage = async (userId: string, packageId: string, paymentMethodId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    const packageData = await Package.findById(packageId);
    if (!packageData) throw new ApiError(StatusCodes.NOT_FOUND, "Package not found");

    let customerId = user.stripeCustomerId;

    // Check if the user is already a Stripe customer
    if (!customerId) {
        const existingCustomers = await stripe.customers.list({ email: user.email });

        if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id;
        } else {
            const customer = await stripe.customers.create({ email: user.email });
            customerId = customer.id;
        }

        user.stripeCustomerId = customerId;
        await user.save();
    }

    // Attach payment method to Stripe customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

    await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId }
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: packageData.stripePriceId }],
        expand: ["latest_invoice.payment_intent"],
    });

    user.stripeSubscriptionId = subscription.id;
    user.subscriptionStatus = "active";
    await user.save();

    return {
        message: "Subscription started successfully",
        subscriptionId: subscription.id,
    };
};
const cancelSubscription = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    if (!user.stripeSubscriptionId) throw new ApiError(StatusCodes.BAD_REQUEST, "No active subscription found");

    // Cancel the subscription in Stripe
    await stripe.subscriptions.del(user.stripeSubscriptionId);

    user.subscriptionStatus = "canceled";
    user.stripeSubscriptionId = null;
    await user.save();

    return { message: "Subscription canceled successfully" };
};

const getUserSubscription = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    if (!user.stripeSubscriptionId) {
        return { message: "No active subscription" };
    }

    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    return {
        status: subscription.status,
        package: subscription.items.data[0].price.product,
        nextBillingDate: new Date(subscription.current_period_end * 1000),
    };
};

export const PackageServices = {
    createPackageIntoDB,
    checkTrialStatus,
    startTrialSubscription,
    getAllPackages,
    getPackageById,
    subscribeToPackage,
    cancelSubscription,
    getUserSubscription
};
