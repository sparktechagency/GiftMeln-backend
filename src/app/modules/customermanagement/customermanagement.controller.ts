import { Request, Response, NextFunction } from 'express';
import { CustomermanagementServices } from './customermanagement.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

// view all customer
const getAllUser = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomermanagementServices.getAllUserFromDB();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User fetched successfully',
        data: result
    })
})



// delete customer

const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CustomermanagementServices.deleteCustomerFromDB(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User deleted successfully',
        data: result
    })
})

// get single one
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CustomermanagementServices.getSingleUserFromDB(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User fetched successfully',
        data: result
    })
})


export const CustomermanagementController = {
    getAllUser,
    deleteCustomer,
    getSingleUser
};
