import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IProduct } from "./product.interface";
import { ProductModel } from "./product.model";

const createProductIntoDB = async (productData: IProduct) => {
    const product = await ProductModel.create(productData);
    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create product");
    }
    // console.log(product);
    return product;
}



// get all products
const getAllProducts = async (filters: any) => {
    try {
        const query: any = {};

        console.log("Received Filters:", filters);

        // ✅ Ensure categoryName filtering works properly
        if (filters?.categoryName) {
            console.log("Applying categoryName filter:", filters.categoryName);
            query["productCategory.categoryName"] = { $regex: new RegExp(filters.categoryName, "i") };
        }

        // ✅ Filter by availability (inStock or outOfStock)
        if (filters.availability) {
            query.availability = filters.availability;
        }

        // ✅ Filter by price range
        if (filters.minPrice || filters.maxPrice) {
            query.regularPrice = {};
            if (filters.minPrice) {
                query.regularPrice.$gte = parseFloat(filters.minPrice);
            }
            if (filters.maxPrice) {
                query.regularPrice.$lte = parseFloat(filters.maxPrice);
            }
        }


        // ✅ Optimized MongoDB Query using $lookup (Best Performance)
        const products = await ProductModel.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "productCategory",
                    foreignField: "_id",
                    as: "productCategory"
                }
            },
            { $unwind: "$productCategory" },
            { $match: query } // Match after populating
        ]);

        if (!products || products.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, "No products found");
        }

        return products;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "No Products found");
    }
};


// get single product
const getSingleProduct = async (id: string) => {
    const product = await ProductModel.findById(id).populate("productCategory");
    if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }
    return product;
}



// update product
const updateProductInDB = async (
    productId: string,
    updatedData: Partial<IProduct>,
    files: { [fieldname: string]: Express.Multer.File[] }
) => {
    // Process files
    if (files.featureImage && files.featureImage.length > 0) {
        updatedData.featureImage = files.featureImage[0].path;
    }
    if (files.additionalImages && files.additionalImages.length > 0) {
        updatedData.additionalImages = files.additionalImages.map(file => file.path);
    }

    // Parse JSON fields if needed
    if (updatedData.tag) {
        try {
            updatedData.tag = JSON.parse(updatedData.tag as unknown as string);
        } catch (error) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid JSON format for tags');
        }
    }

    // Update the product in the database
    const product = await ProductModel.findByIdAndUpdate(productId, updatedData, {
        new: true, // Return the updated product
        runValidators: true, // Apply schema validators
    });

    if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    return product;
};




export const productService = {
    createProductIntoDB,
    getAllProducts,
    getSingleProduct,
    updateProductInDB
}