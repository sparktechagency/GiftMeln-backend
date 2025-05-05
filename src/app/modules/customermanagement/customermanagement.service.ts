import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { Package } from '../package/package.model';

// gat all customer
const getAllUserFromDB = async () => {
  const result = await User.find();
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found');
  }
  return result;
};

// delete customer
const deleteCustomerFromDB = async (id: string) => {
  const result = await User.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to delete user');
  }
  return result;
};

// get single one
const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return result;
};

// track customer subscription
//! todo: get all subscriptions from user is not work properly
const getSubscriptionPlanFromDB = async (id: string) => {
  const result = await Package.find({ user: id });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return result;
};

const editUserDetailsFromDB = async (id: string, payload: any) => {
  const result = await User.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return result;
};

export const CustomerManagementServices = {
  getAllUserFromDB,
  deleteCustomerFromDB,
  getSingleUserFromDB,
  getSubscriptionPlanFromDB,
   editUserDetailsFromDB
};
