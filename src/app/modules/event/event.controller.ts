import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import { EventServices } from './event.service';
import { JwtPayload } from 'jsonwebtoken';

// create event
const createEvent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user || req.authId;
  const eventData = req.body;
  const result = await EventServices.createEventIntoDB(user!, eventData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event created successfully',
    data: { result },
  });
});

// get all events
const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.getAllEventsFromDB();
  sendResponse(res, {
    Total: result?.length,
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All events retrieved successfully',
    data: result,
  });
});

// get user events
const getUserEvents = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await EventServices.getUserEventFromDB(user.id || user.authId);
  sendResponse(res, {
    Total: result?.length,
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User events retrieved successfully',
    data: result,
  });
});

// get single event
const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const result = await EventServices.getSingleEventFromDB(eventId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single event retrieved successfully',
    data: result,
  });
});

// delete event
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const result = await EventServices.deleteEventFromDB(eventId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event deleted successfully',
    data: result,
  });
});

// updateEvent
const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const eventData = req.body;
  const result = await EventServices.updateEventInDB(eventId, eventData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event updated successfully',
    data: result,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  deleteEvent,
  updateEvent,
  getUserEvents,
};
