import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import { EventServices } from "./event.service";


const createEvent = catchAsync(async (req: Request, res: Response) => {
    const eventData = req.body;
    console.log("eventData=???????", eventData);
    const result = await EventServices.createEventIntoDB(eventData);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Event created successfully',
        data: { result },
    });
});



export const EventController = {
    createEvent,
};
