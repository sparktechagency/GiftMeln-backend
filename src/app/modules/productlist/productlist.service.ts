import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IProductList } from './productlist.interface';
import { ProductList } from './productlist.model';
import QueryBuilder from '../../builder/QueryBuilder';
const createProductListIntoDB = async (payload: IProductList) => {
  const result = await ProductList.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create product list',
    );
  }
  return result;
};

const getAllProductListForDashboard = async (
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(ProductList.find(), query);
  queryBuilder.filter().sort().fields().paginate();
  const data = await queryBuilder.modelQuery;
  const pagination = await queryBuilder.getPaginationInfo();
  return {
    success: true,
    message: 'Product list fetched successfully',
    data,
    pagination,
  };
};

export const ProductListServices = {
  createProductListIntoDB,
  getAllProductListForDashboard,
};
