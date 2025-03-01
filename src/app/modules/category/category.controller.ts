import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import catchAsync from "../../../shared/catchAsync";
import { categoryService } from "./category.service";
import sendResponse from "../../../shared/sendResponse";



// create category controller

const createCategory = catchAsync(async (req, res) => {
    const categoryData = req.body;
    const result = await categoryService.createCategories(categoryData);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create category')
    }
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Category created successfully',
        data: result,
    })
})



// update category controller
const updateCategory = catchAsync(async (req, res) => {
    const categoryData = req.body;
    const categoryId = req.params.id;
    const result = await categoryService.updateCategory(categoryId, categoryData);
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Category updated successfully',
        data: result,
    })
})

// get all categories 

const getAllCategories = catchAsync(async (req, res) => {
    const result = await categoryService.getAllCategories();
    sendResponse(res, {
        // Total: result.length,
        success: true,
        statusCode: StatusCodes.OK,
        message: 'All categories retrieved successfully',
        data: result,
    });
})

// single category 

const getSingleCategory = catchAsync(async (req, res) => {
    const categoryId = req.params.id;
    const result = await categoryService.getSingleCategory(categoryId);
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Single category retrieved successfully',
        data: result,
    })
})
//delete category
const deleteCategory = catchAsync(async (req, res) => {
    const categoryId = req.params.id;
    const result = await categoryService.deleteCategoryIntoDB(categoryId);
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Category deleted successfully',
        data: result,
    })
})

// export category controller
export const categoryController = {
    createCategory,
    updateCategory,
    getAllCategories,
    getSingleCategory,
    deleteCategory
}