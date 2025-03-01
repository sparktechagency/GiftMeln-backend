import { StatusCodes } from "http-status-codes";
import { IPackage } from "../app/modules/package/package.interface";
import ApiError from "../errors/ApiError";
import { stripe } from "../config/stripe";
import config from "../config";

export const createSubscriptionProductHelper = async (
    payload: Partial<IPackage>
): Promise<{ productId: string; paymentLink: string } | null> => {
    try {

        if (!payload.name || !payload.description || !payload.price) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required package details");
        }

        // Step 1: Create a product in Stripe
        const product = await stripe.products.create({
            name: payload.name as string,
            description: payload.description,
        });

        if (!product?.id) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create product in Stripe");
        }

        let interval: "month" | "year" = "month";
        let intervalCount = 1;

        switch (payload.duration) {
            case "month":
                interval = "month";
                intervalCount = 1;
                break;
            case "year":
                interval = "year";
                intervalCount = 1;
                break;
            case "7 days":
                interval = "month"; // Stripe does not support 'days'
                intervalCount = 1;
                break;
            default:
                throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid duration");
        }


        // Step 2: Create Price for the Product
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(Number(payload.price) * 100),
            currency: "usd",
            recurring: { interval, interval_count: intervalCount },
        });


        if (!price?.id) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create price in Stripe");
        }

        // Step 3: Create a Payment Link
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            after_completion: {
                type: "redirect",
                redirect: {
                    // url: config.stripe.paymentSuccess || "http://localhost:3000/payment/success",
                    url: "http://localhost:3000/surveyQuestions",

                },
            },
            metadata: {
                productId: String(product.id),
            },
        });


        if (!paymentLink?.url) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create payment link");
        }

        return { productId: product.id, paymentLink: paymentLink.url };
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Subscription creation failed: ${error}`);
    }
};
