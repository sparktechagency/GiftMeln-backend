import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { EventModel } from './event.interface';
import { Event } from './event.model';
import { CATEGORY } from '../../../enums/category';


// create event into database
const createEventIntoDB = async (eventData: EventModel) => {
    try {

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


// get all events from database
const getAllEventsFromDB = async () => {
    try {
        const events = await Event.find({});
        if (!events) {
            throw new ApiError(StatusCodes.NOT_FOUND, "No events found");
        }

        return events;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// get single event from database
const getSingleEventFromDB = async (id: string) => {
    try {
        const event = await Event.findById(id);
        if (!event) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
        }

        return event;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const deleteEventFromDB = async (id: string) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
        }

        return deletedEvent;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// update event in database
const updateEventInDB = async (id: string, eventData: EventModel) => {
    try {
        const { category }: any = eventData;

        if (!category || !Object.values(CATEGORY).includes(category)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Category must be one of: Birthday, Anniversary, Wedding, Friendship Day, Graduation, or Others');
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, eventData, { new: true });
        if (!updatedEvent) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
        }

        return updatedEvent;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const EventServices = {
    createEventIntoDB,
    getAllEventsFromDB,
    getSingleEventFromDB,
    deleteEventFromDB,
    updateEventInDB
};
