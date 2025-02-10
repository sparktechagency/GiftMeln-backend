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
const getAllProducts = async () => {
    const products = await ProductModel.find().populate("Category");
    console.log("products=======>", products);
    if (!products) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No products found");
    }
    return products;
}

// get single product
const getSingleProduct = async (id: string) => {
    const product = await ProductModel.findById(id).populate("Category");
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