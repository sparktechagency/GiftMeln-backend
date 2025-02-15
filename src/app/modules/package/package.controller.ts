import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { PackageServices } from './package.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { createOneTimeProductHelper } from '../../../helpers/createOneTimeProductHelper';





const createPackage = catchAsync(
    async (req: Request, res: Response) => {
        const { ...productData } = req.body;
        const result = await PackageServices.createPackageIntoDB(productData);
        console.log("My package result=???", result);
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Package Create successfully.',
            data: result,
        });
    }
);


/*
*checkUserTrial 
*/
const checkUserTrial = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await PackageServices.checkTrialStatus(userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Trial status checked successfully.',
        data: result,
    });
})


// single product purchase request
const createOneTimePackage = catchAsync(
    async (req: Request, res: Response) => {
        const { name, description, price } = req.body;

        // Call helper function
        const result = await createOneTimeProductHelper({ name, description, price });

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'One-time purchase product created successfully.',
            data: result,
        });
    }
);


export const PackageController = {
    createPackage,
    checkUserTrial,
    createOneTimePackage
};
