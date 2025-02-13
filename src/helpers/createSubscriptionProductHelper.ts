import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiError";
import { stripe } from "../config/stripe";

export const createSubscriptionProductHelper = async ({
    name,
    description,
    price,
    duration,
}: {
    name: string;
    description: string;
    price: number;
    duration: string;
}) => {
    try {
        // Step 1: Create a product in Stripe
        const product = await stripe.products.create({
            name,
            description,
        });

        // Step 2: Create a price (this will be associated with the product)
        const priceObject = await stripe.prices.create({
            unit_amount: price * 100,  // Stripe expects amount in cents
            currency: "usd",
            product: product.id,
            recurring: {
                interval: duration === "7 days" ? "week" : "month",  // You can set this based on duration
            },
        });

        // Step 3: Create a payment link for this product
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: priceObject.id,
                    quantity: 1,
                },
            ],
            after_completion: {
                type: 'redirect',
                redirect: { url: 'http://localhost:3000/payment/success' },
            },
        });

        return {
            productId: product.id,
            paymentLink: paymentLink.url,  // Provide the payment link URL
        };
    } catch (error: any) {
        console.error("Error creating subscription product in Stripe:", error.message);
        throw new ApiError(StatusCodes.BAD_REQUEST, `Failed to create subscription product in Stripe: ${error.message}`);
    }
};
