
import { Router } from "express";
import { productController } from "./product.controller";
import validateRequest from "../../middlewares/validateRequest";
import { productValidation } from "./product.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";

const router = Router();

router.post(
    '/create',
    fileUploadHandler()
    ,
    // validateRequest(productValidation.ProductValidationSchema),
    productController.createProduct
);



router.get('/', productController.getAllProducts);
router.get('/:id', productController.getSingleProduct);

export const productRoute = router;
