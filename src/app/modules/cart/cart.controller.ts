import { Request, Response, NextFunction } from 'express';
import { CartServices } from './cart.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';


//create cart constructor
const createCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { user, product } = req.body;

    if (!user || !product) {
        return sendResponse(res, {
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: 'User and Product are required',
            data: {},
        });
    }

    const result = await CartServices.createCartServiceIntoDB({ user, product });

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Cart created successfully',
        data: result,
    });
});


// get all cart items
const getAllCartItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await CartServices.getAllCart();

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Cart items retrieved successfully',
        data: result,
    });
});

// get single cart
const getSingleCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const cartId = req.params.id;

    const result = await CartServices.getSingleCart(cartId);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Single cart retrieved successfully',
        data: result,
    });
});


export const CartController = {
    createCart,
    getAllCartItems,
    getSingleCart
};
