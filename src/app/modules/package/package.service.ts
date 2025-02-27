import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import { createSubscriptionProductHelper } from '../../../helpers/createSubscriptionProductHelper';
import { User } from '../user/user.model';
import { stripe } from '../../../config/stripe';
import { Subscription } from '../payment/payment.model';
import { Types } from 'mongoose';


const createPackageIntoDB = async (payload: IPackage) => {
    if (!payload.trialEndsAt) {
        payload.trialEndsAt = new Date();
    }

    const productPayload = {
        name: payload.name,
        description: payload.description,
        duration: payload.duration,
        price: Number(payload.price),
        paymentType: payload.paymentType,
        features: payload.features,
        category: payload.category
    };



    const product = await createSubscriptionProductHelper(productPayload);

    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product");
    }


    // ✅ Add Stripe details to the payload
    payload.paymentLink = product.paymentLink;
    payload.productId = product.productId;

    const result = await Package.create(payload);
    if (!result) {
        await stripe.products.del(product.productId);
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to created Package")
    }

    return result;

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
const subscribeToPackage = async (userId, packageId, paymentMethodId) => {
    console.log('🔍 Debug: Entered subscribeToPackage Function');

    const user = await User.findById(userId);
    if (!user) {

        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
        console.log('❌ Debug: Package not found');
        throw new ApiError(StatusCodes.NOT_FOUND, "Package not found");
    }
    console.log('✅ Debug: Selected Package:', selectedPackage);

    let userSubscription = await Subscription.findOne({ user: userId });
    console.log('🔍 Debug: User Subscription:', userSubscription);

    if (!userSubscription) {
        console.log('📦 Debug: No existing subscription. Creating new...');
        userSubscription = await Subscription.create({
            user: userId,
            subscriptions: [
                {
                    package: packageId,
                    subscriptionId: `sub_${Date.now()}`,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    amountPaid: selectedPackage.price,
                    status: "active",
                    paymentType: "subscription",
                },
            ],
        });
        console.log('✅ Debug: New Subscription Created:', userSubscription);
        return {
            message: "New subscription created successfully",
        };
    }

    console.log('🔄 Debug: Checking existing subscriptions...');
    const existingSubscription = userSubscription.subscriptions.find(
        (sub) => sub.package.toString() === packageId
    );
    if (existingSubscription) {
        if (existingSubscription.status === "expired") {
            console.log('🔄 Debug: Reactivating expired subscription...');
            existingSubscription.currentPeriodStart = new Date();
            existingSubscription.currentPeriodEnd = new Date(
                new Date().setMonth(new Date().getMonth() + 1)
            );
            existingSubscription.status = "active";
            existingSubscription.amountPaid += selectedPackage.price;

            userSubscription.markModified('subscriptions');
            await userSubscription.save();
            console.log('✅ Debug: Reactivated Expired Subscription:', userSubscription);

            return {
                message: "Expired subscription reactivated successfully",
            };
        } else {
            console.log('⚠️ Debug: Already subscribed to this package');
            throw new ApiError(StatusCodes.BAD_REQUEST, "Already subscribed to this package");
        }
    }

    userSubscription.subscriptions.push({
        package: packageId,
        subscriptionId: `sub_${Date.now()}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        amountPaid: selectedPackage.price,
        status: "active",
        paymentType: "subscription",
    });

    console.log('🔍 Debug: Before Saving:', userSubscription);

    // Mark the array as modified
    userSubscription.markModified('subscriptions');

    // Save the updated subscription
    await userSubscription.save();
    console.log('✅ Debug: Saved Subscription:', userSubscription);

    return {
        message: "New subscription created successfully",
    };
};



const cancelSubscription = async (userId, subscriptionId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    const userSubscription = await Subscription.findOne({ user: userId });

    if (!userSubscription) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User subscription not found");
    }

    const subscriptionToCancel = userSubscription.subscriptions.find(
        (sub) => sub.subscriptionId === subscriptionId
    );

    if (!subscriptionToCancel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Subscription not found");
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.del(subscriptionId);

    subscriptionToCancel.status = "canceled";
    await userSubscription.save();

    return { message: "Subscription canceled successfully" };
};


const getUserSubscription = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    const userSubscription = await Subscription.findOne({ user: userId }).populate('subscriptions.package');

    if (!userSubscription) {
        return { message: "No active subscriptions" };
    }

    return {
        subscriptions: userSubscription.subscriptions.map((sub) => ({
            package: sub.package.name,
            price: sub.package.price,
            status: sub.status,
            nextBillingDate: sub.currentPeriodEnd,
        })),
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
