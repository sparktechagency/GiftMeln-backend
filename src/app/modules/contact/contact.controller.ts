import { Request, Response } from 'express';
import { ContactServices } from './contact.service';
import catchAsync from '../../../shared/catchAsync';
import { IContact } from './contact.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

// send email controller
// 
const emailController = catchAsync(async (req: Request, res: Response) => {
    const contactData: IContact = req.body;

    // Ensure we wait for the result
    const result = await ContactServices.createControllerService(contactData);

    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to send email');
    }

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Email sent successfully',
        data: result,
    });
});

const getAllContacts = catchAsync(async (req: Request, res: Response) => {
    const result = await ContactServices.getAllContactsFromDB();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Contacts retrieved successfully',
        data: result,
    });
})
export const ContactController = {
    emailController,
    getAllContacts
};
