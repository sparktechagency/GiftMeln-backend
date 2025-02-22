import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ContactController } from './contact.controller';
import { IContact } from './contact.interface';
import { Contact } from './contact.model';
const createControllerService = async (contactData: IContact) => {
    const contact = await Contact.create(contactData)
    if (!contact) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to send email');
    }
    return contact;

};

const getAllContactsFromDB = async () => {
    const result = await Contact.find();
    if (!result) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get all contacts');
    }
    return result;
}

export const ContactServices = {
    createControllerService,
    getAllContactsFromDB
};
