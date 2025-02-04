import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { EventModel } from './event.interface';
import { Event } from './event.model';

const createEventIntoDB = async (eventData: EventModel) => {
    try {
        const event = (await Event.create(eventData));
        if (!event) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create the event");
        }

        return event
    } catch (error) {
        console.log(error);
    }

}

export const EventServices = {
    createEventIntoDB
};
