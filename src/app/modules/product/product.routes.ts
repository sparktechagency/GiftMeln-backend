
import { NextFunction, Request, Response, Router } from "express";
import { productController } from "./product.controller";
import validateRequest from "../../middlewares/validateRequest";
// import { productValidation } from "./product.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { getMultipleFilesPath, getSingleFilePath } from "../../../shared/getFilePath";

const router = Router();

router.post(
    '/create',
    fileUploadHandler(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = req.body;
            const featureImage = getSingleFilePath(req.files, 'feature');
            const additionalImages = getMultipleFilesPath(req.files, 'additional');

            req.body = {
                featureImage,
                additionalImages,
                ...payload,
            }
            next();
        } catch (error) {
            res.status(500).json({ message: "Failed to upload Image" });
        }
    },
    // validateRequest(productValidation.ProductValidationSchema),
    productController.createProduct
);



router.get('/', productController.getAllProducts);
router.get('/:id', productController.getSingleProduct);

router.patch(
    '/update/:id',
    fileUploadHandler(),
    productController.updateProduct
);

export const productRoute = router;
