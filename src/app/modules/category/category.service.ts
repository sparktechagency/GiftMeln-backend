import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";
import { ProductModel } from "../product/product.model";

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


// get all categories
const getAllCategories = async () => {
    try {
        const categories = await Category.find();

        if (!categories || categories.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, "No categories found");
        }

        // Fetch total product count for each category
        const categoryCounts = await ProductModel.aggregate([
            {
                $group: {
                    _id: "$productCategory",
                    totalProducts: { $sum: 1 },
                },
            },
        ]);

        // Map product counts to categories
        const categoriesWithCounts = categories?.map((category) => {
            const categoryCount = categoryCounts.find(
                (c) => String(c._id) === String(category._id)
            );

            return {
                ...category.toObject(),
                totalProducts: categoryCount ? categoryCount.totalProducts : 0,
            };
        });

        return {
            success: true,
            message: "All categories retrieved successfully",
            data: categoriesWithCounts,
        };
    } catch (error) {
        console.error("Error occurred:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error fetching categories");
    }
};



// get single category

const getSingleCategory = async (id: string) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }
    return category;
}


// export categories
export const categoryService = {
    createCategories,
    updateCategory,
    getAllCategories,
    getSingleCategory
}