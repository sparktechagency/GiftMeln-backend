import { JwtPayload } from "jsonwebtoken";
import { IPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import { stripe } from "../../../config/stripe";
import { User } from "../user/user.model";


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


export const PaymentServices = {
    subscriptionDetailsFromDB
};
