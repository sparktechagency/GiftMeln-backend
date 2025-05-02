import { Request, Response, NextFunction } from 'express';
import { OnetimepaymentServices } from './onetimepayment.service';
import catchAsync from '../../../shared/catchAsync';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';


const purchaseData = catchAsync(async (req: Request, res: Response) => {
    const result = await OnetimepaymentServices.getAllProductPurchaseDataIntoDB();
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Purchase data fetched successfully",
        data: result,
    });
});

export const OnetimepaymentController = {
    purchaseData
};
