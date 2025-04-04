import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import { createSubscriptionProductHelper } from '../../../helpers/createSubscriptionProductHelper';
import { User } from '../user/user.model';
import { stripe } from '../../../config/stripe';
import { Types } from 'mongoose';
import { Subscription } from '../payment/payment.model';


// const createPackageIntoDB = async (payload: IPackage) => {
//     if (!payload.trialEndsAt) {
//         payload.trialEndsAt = new Date();
//     }
//     const productPayload = {
//         name: payload.name,
//         description: payload.description,
//         duration: payload.duration,
//         price: payload.paymentType === "Free" ? 0 : Number(payload.price),
//         paymentType: payload.paymentType,
//         features: payload.features,
//         category: payload.category
//     };
//     console.log("Product payload", productPayload);
//     const product = await createSubscriptionProductHelper(productPayload);
//     if (!product) {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product");
//     }
//     // ✅ Add Stripe details to the payload
//     payload.paymentLink = product.paymentLink;
//     payload.productId = product.productId;

//     const result = await Package.create(payload);
//     if (!result) {
//         await stripe.products.del(product.productId);
//         throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to created Package")
//     }
//     return result;
// };
const createPackageIntoDB = async (payload: IPackage) => {
    if (!payload.trialEndsAt) {
        payload.trialEndsAt = new Date();
    }

    let product;

    if (payload.paymentType === "Free") {
        // ✅ Generate a Stripe Checkout session for Free Trial
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: "Free Trial Plan" },
                        unit_amount: 0, // Free Plan
                        recurring: { interval: "month" }, // Set your trial duration
                    },
                    quantity: 1,
                },
            ],
            success_url: "https://yourdomain.com/success",
            cancel_url: "https://yourdomain.com/cancel",
        });

        // ✅ Assign Stripe details for Free Plan
        product = {
            paymentLink: session.url,
            productId: session.id,
        };
    } else {
        const productPayload = {
            name: payload.name,
            description: payload.description,
            duration: payload.duration,
            price: Number(payload.price),
            paymentType: payload.paymentType,
            features: payload.features,
            category: payload.category,
            isRecommended: payload.isRecommended,
            updatePrice: payload.updatePrice,
        };

        console.log("🟢 Sending productPayload to createSubscriptionProductHelper:", productPayload);

        product = await createSubscriptionProductHelper(productPayload);
        if (!product) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product");
        }
    }
    // @ts-ignore
    payload.paymentLink = product.paymentLink;
    payload.productId = product.productId;

    // ✅ Create Package in MongoDB
    const result = await Package.create(payload);
    if (!result) {
        if (payload.paymentType !== "Free") {
            await stripe.products.del(payload.productId!);
        }
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Package");
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
    // @ts-ignore
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
const subscribeToPackage = async (
    userId: string,
    packageId: string,
    paymentMethodId: string
) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }

        const packageData = await Package.findById(packageId);
        if (!packageData) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Package not found");
        }

        if (!user.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                payment_method: paymentMethodId,
                invoice_settings: { default_payment_method: paymentMethodId },
            });

            user.stripeCustomerId = customer.id;
            await user.save();
        }

        const subscription = await stripe.subscriptions.create({
            customer: user.stripeCustomerId,
            items: [{ price: packageData.productId }], // Ensure packageData.productId is a valid Stripe price ID
            default_payment_method: paymentMethodId,
            expand: ["latest_invoice.payment_intent"],
        });

        const newSubscription = new Subscription({
            customerId: user.stripeCustomerId,
            package: new Types.ObjectId(packageId),
            subscriptionId: subscription.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            amountPaid: packageData.price,
            status: "active",
            paymentType: "subscription",
            createdAt: new Date(),
            updatedAt: new Date(),
        });


        const savedSubscription = await newSubscription.save();
        return {
            message: "Subscription successful!",
            subscription: savedSubscription
        };

    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Subscription failed");
    }
};



// @ts-ignore
const cancelSubscription = async (userId, subscriptionId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    const userSubscription = await Subscription.findOne({ user: userId });

    if (!userSubscription) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User subscription not found");
    }
    // @ts-ignore
    const subscriptionToCancel = userSubscription.subscriptions.find(
        // @ts-ignore
        (sub) => sub.subscriptionId === subscriptionId
    );

    if (!subscriptionToCancel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Subscription not found");
    }

    // Cancel the subscription in Stripe
    // @ts-ignore
    await stripe.subscriptions.del(subscriptionId);

    subscriptionToCancel.status = "canceled";
    await userSubscription.save();

    return { message: "Subscription canceled successfully" };
};

const getUserSubscription = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    const userSubscription = await Subscription.findOne({ user: userId }).populate('subscriptions.package');

    if (!userSubscription) {
        return { message: "No active subscriptions" };
    }

    return {
        // @ts-ignore
        subscriptions: userSubscription.subscriptions.map((sub) => ({
            package: sub.package.name,
            price: sub.package.price,
            status: sub.status,
            nextBillingDate: sub.currentPeriodEnd,
        })),
    };
};


// user subscription from all user
const getAllUserSubscriptions = async () => {
    const subscriptions = await Subscription.find().populate('package').populate('user');
    if (subscriptions.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No subscriptions found");
    }
    return subscriptions;
};


// update package 
const updatePackageIntoDB = async (id: string, payload: Partial<IPackage>) => {
    const packageData = await Package.findById(id)
    if (!packageData) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Package not found");
    }
    let updatedProduct;
    let updatedPriceMonthly;
    let updatedPriceYearly;
    if (payload.updatePrice || payload.price) {
        if (payload.duration === "month" || payload.duration === "year") {
            const priceData = {
                unit_amount: (payload.updatePrice || payload.price!) * 100,
                currency: 'usd',
            }
            if (payload.duration === "month") {
                updatedPriceMonthly = await stripe.prices.update(packageData?.stripePriceId!, {
                    ...priceData,
                    recurring: { interval: "month" }
                })
            }
            if (payload.duration === "year") {
                updatedPriceYearly = await stripe.prices.update(packageData?.stripePriceId!, {
                    ...priceData,
                    recurring: { interval: "year" }
                })
                packageData.stripePriceId = updatedPriceYearly.id;
            }
        }
    }

    const updatedPackage = await Package.findByIdAndUpdate(id, payload, { new: true })
    return updatedPackage;
}


export const PackageServices = {
    createPackageIntoDB,
    checkTrialStatus,
    startTrialSubscription,
    getAllPackages,
    getPackageById,
    subscribeToPackage,
    cancelSubscription,
    getUserSubscription,
    getAllUserSubscriptions,
    updatePackageIntoDB
};
