import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";

// create categories
const createCategories = async (categoryData: ICategory) => {
    const category = await Category.create(categoryData);
    if (!category) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create category");
    }
    return category;
}




// update categories
const updateCategory = async (id: string, categoryData: ICategory) => {
    const category = await Category.findByIdAndUpdate(id, categoryData, { new: true });
    if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }
    return category;
}



// export categories
export const categoryService = {
    createCategories,
    updateCategory,
}