import { stripe } from "../config/stripe";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";

export const createOneTimeProductHelper = async ({
    name,
    description,
    price,
}: {
    name: string;
    description: string;
    price: number;

}) => {
    try {

        // creating product
        const product = await stripe.products.create({
            name,
            description,
        })

        // create one time price 
        const priceObject = await stripe.prices.create({
            unit_amount: price * 100,
            currency: 'usd',
            product: product.id,
            active: true,
        })

        // create payment link

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
            throw new ApiError(StatusCodes.BAD_REQUEST, "Can't create payment link")
        }
        if (!product.id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Can't create payment")
        }
        return {
            productId: product.id,
            paymentLink: paymentLink.url,
        }

    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Failed to create product ${error}`)
    }
}