import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiError";
import { stripe } from "../config/stripe";

export const createSubscriptionProductHelper = async (payload: {
    name: string;
    description: string;
    duration: "7 days" | "1 month" | "1 year";
    price?: number;
}) => {
    // create product in stripe
    const product = await stripe.products.create({
        name: payload.name as string,
        description: payload.description as string,
    })
    let interval: "day" | "month" | "year";
    let intervalCount = 1;

    switch (payload.duration) {
        case "7 days":
            interval = "day";
            intervalCount = 7;
            break;
        case "1 month":
            interval = "month";
            intervalCount = 1;
            break;
        case "1 year":
            interval = "year";
            intervalCount = 1;
            break;
        default:
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid duration");
    }

    // Create price (except for free trial)
    let price = null;
    let paymentLink = null;
    if (payload.duration !== "7 days") {
        price = await stripe.prices.create({
            product: product.id,
            unit_amount: (payload.price ?? 0) * 100, // Convert to cents
            currency: "usd",
            recurring: {
                interval,
                interval_count: intervalCount,
            },
        });

        if (!price) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create price in stripe")
        }

        paymentLink = await stripe.paymentLinks.create({
            line_items: [{ price: price.id, quantity: 1 }],
            after_completion: {
                type: "redirect",
                redirect: {
                    url: `${process.env.STRIPE_PAYMENT_SUCCESS_URL}`,
                },
            },
            metadata: { productId: product.id },
        });

        if (!paymentLink) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create payment link in Stripe");
        }
    }
    console.log(" This is my payment link=====>", paymentLink);
    return {
        productId: product.id,
        paymentLink: paymentLink
    }
}