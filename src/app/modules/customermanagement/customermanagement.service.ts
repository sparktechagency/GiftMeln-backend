import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { CustomermanagementModel, ICustomermanagement } from './customermanagement.interface';


// gat all customer
const getAllUserFromDB = async () => {
    const result = await User.find();
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'No user found');
    }
    return result;
}


// edit user details
const editUserFromDB = async (id: string, payload: Partial<ICustomermanagement>) => {
    const result = await User.findOneAndUpdate({ id }, payload, { new: true });
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to update user');
    }
    return result;
}


// delete customer
const deleteCustomerFromDB = async (id: string) => {
    const result = await User.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to delete user');
    }
    return result;
}

// get single one
const getSingleUserFromDB = async (id: string) => {
    const result = await User.findById(id);
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return result;
}



export const CustomermanagementServices = {
    getAllUserFromDB,
    editUserFromDB,
    deleteCustomerFromDB,
    getSingleUserFromDB
};
