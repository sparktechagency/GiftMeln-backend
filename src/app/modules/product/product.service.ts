import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IProduct } from "./product.interface";
import { ProductModel } from "./product.model";

const createProductIntoDB = async (productData: IProduct) => {
    const product = await ProductModel.create(productData);
    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create product");
    }

    return product;
}



// get all products
const getAllProducts = async () => {
    const products = await ProductModel.find();
    if (!products) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No products found");
    }
    return products;
}

// get single product
const getSingleProduct = async (id: string) => {
    const product = await ProductModel.findById(id);
    if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }
    return product;
}

export const productService = {
    createProductIntoDB,
    getAllProducts,
    getSingleProduct,
}