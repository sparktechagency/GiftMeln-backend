import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PaymentServices } from "./payment.service";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";


const subscriptionDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentServices.subscriptionDetailsFromDB(req.user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Details Retrieved Successfully",
        data: result.subscription
    })
});

// get all subscription
const allSubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentServices.getAllSubscriptionIntoDB();
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No data found");
    }
    sendResponse(res, {
        success: true,
        Total: result.length,
        statusCode: StatusCodes.OK,
        message: 'Subscriptions fetched successfully',
        data: result,
    });
});


// get all subscription history base this user
const getSubscriptionHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentServices.getSubscriptionHistory(req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Subscription history retrieved successfully.',
        data: result,
    });
})


export const PaymentController = {
    subscriptionDetails,
    allSubscription,
    getSubscriptionHistory
};
