import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PaymentServices } from "./payment.service";
import { StatusCodes } from "http-status-codes";


const subscriptionDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentServices.subscriptionDetailsFromDB(req.user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Details Retrieved Successfully",
        data: result.subscription
    })
});



export const PaymentController = {
    subscriptionDetails
};
