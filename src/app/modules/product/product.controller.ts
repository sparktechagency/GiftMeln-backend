import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { productService } from "./product.service";
import ApiError from "../../../errors/ApiError";

const createProduct = catchAsync(async (req, res) => {
    const result = await productService.createProductIntoDB(req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Product created successfully',
        data: result,
    });
});




// get all products
const getAllProducts = catchAsync(async (req, res) => {
    const result = await productService.getAllProducts();
    sendResponse(res, {
        Total: result?.length,
        success: true,
        statusCode: StatusCodes.OK,
        message: "All products retrieved successfully",
        data: result,
    });
})


// get single one
const getSingleProduct = catchAsync(async (req, res) => {
    const productId = req.params.id;
    const result = await productService.getSingleProduct(productId);
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Single product retrieved successfully",
        data: result,
    });
})


// update product
const updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params; // Product ID
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updatedData = req.body;

    // Delegate advanced logic to the service layer
    const updatedProduct = await productService.updateProductInDB(id, updatedData, files);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Product updated successfully',
        data: updatedProduct,
    });
});




export const productController = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
}