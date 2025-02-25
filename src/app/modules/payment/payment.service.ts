import { JwtPayload } from "jsonwebtoken";
import { IPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import { stripe } from "../../../config/stripe";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";


const subscriptionDetailsFromDB = async (user: JwtPayload): Promise<{ subscription: IPayment | {} }> => {

    const subscription = await Payment.findOne({ user: user?.id }).populate("package").lean()
    // if not found any subscription for the user, return an empty object
    if (!subscription) {
        return { subscription: {} }
    }
    const subscriptionFromStripe = await stripe.subscriptions.retrieve(subscription?.subscriptionId);
    if (subscriptionFromStripe?.status !== 'active') {
        await Promise.all([
            User.findByIdAndUpdate(user.id), { isSubscribed: false }, { new: true },
            Payment.findOneAndUpdate({
                user: user.id
            }, { status: "expired" }, { new: true })
        ])
    }
    return { subscription }
}
// 
const getAllSubscriptionIntoDB = async () => {
    const subscription = await Payment.find().limit(20).populate({
        path: "package",
        model: "package",// Ensure it matches the actual model name
    });
    if (!subscription.length) {
        throw new ApiError(StatusCodes.BAD_GATEWAY, "Can't Find any Subscription");
    }
    return subscription;
};



export const PaymentServices = {
    subscriptionDetailsFromDB,
    getAllSubscriptionIntoDB
};
