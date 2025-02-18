import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import { createSubscriptionProductHelper } from '../../../helpers/createSubscriptionProductHelper';
import { User } from '../user/user.model';
import { stripe } from '../../../config/stripe';


const createPackageIntoDB = async (payload: IPackage) => {
    const trialEndsAt = payload.duration === "7 days" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

    const product = await createSubscriptionProductHelper({
        name: payload.name,
        description: payload.description,
        duration: payload.duration,
        price: payload.price ?? 0,
    });

    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product");
    }

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

    // console.log("Package created successfully!", createdPackage);
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
            customerId = existingCustomers.data[0].id; // ✅ Use the existing customer ID
            console.log("✅ Using existing Stripe customer:", customerId);
        } else {
            try {
                // ✅ Create new Stripe customer if not found
                const customer = await stripe.customers.create({ email: user.email });
                customerId = customer.id;
                console.log("✅ Created new Stripe customer:", customerId);
            } catch (error) {
                console.error("❌ Error creating Stripe customer:", error);
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Stripe customer creation failed.");
            }
        }

        // ✅ Save customer ID to database
        user.stripeCustomerId = customerId;
        await user.save();
    }

    // ✅ Attach payment method to customer
    try {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    } catch (error) {
        console.error("❌ Error attaching payment method:", error);
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

        console.log("✅ Created Stripe subscription:", subscription.id);
    } catch (error) {
        console.error("❌ Error creating Stripe subscription:", error);
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




export const PackageServices = {
    createPackageIntoDB,
    checkTrialStatus,
    startTrialSubscription
};
