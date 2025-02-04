import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { EventModel } from './event.interface';
import { Event } from './event.model';
import { CATEGORY } from '../../../enums/category';

const createEventIntoDB = async (eventData: EventModel) => {
    try {
        const { category }: any = eventData;

        if (!category || !Object.values(CATEGORY).includes(category)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Category must be one of: Birthday, Anniversary, Wedding, Friendship Day, Graduation, or Others');
        }

        const event = await Event.create(eventData);
        if (!event) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create the event");
        }

        return event;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const EventServices = {
    createEventIntoDB
};
