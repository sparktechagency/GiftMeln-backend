import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { productService } from "./product.service";
import ApiError from "../../../errors/ApiError";

const createProduct = catchAsync(async (req, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files.featureImage || files.featureImage.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Feature image is required");
    }

    // File paths assigned to req.body
    req.body.featureImage = files.featureImage[0].path;
    req.body.additionalImages = files.additionalImages ? files.additionalImages.map(file => file.path) : [];
    const productData = req.body;
    const result = await productService.createProductIntoDB(productData);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Product created successfully",
        data: result,
    });
})


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



export const productController = {
    createProduct,
    getAllProducts,
    getSingleProduct
}