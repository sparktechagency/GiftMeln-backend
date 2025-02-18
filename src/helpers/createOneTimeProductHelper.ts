
import { StatusCodes } from "http-status-codes";
import { stripe } from "../config/stripe";
import ApiError from "../errors/ApiError";

export const createOneTimeProductHelper = async (params: {
    name: string;
    description: string;
    price: number;
}) => {
    try {
        const product = await stripe.products.create({
            name: params.name,
            description: params.description,
        });

        const priceObject = await stripe.prices.create({
            unit_amount: params.price * 100,
            currency: 'usd',
            product: product.id,
            active: true,
        });

        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: priceObject.id,
                    quantity: 1,
                },
            ],
            after_completion: {
                type: "redirect",
                redirect: { url: 'http://localhost:3000/payment/success' }
            }
        });

        if (!paymentLink) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Can't create payment link");
        }

        return {
            productId: product.id,
            paymentLink: paymentLink.url,
        };
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Failed to create product: ${error}`);
    }
};