// import { Router } from "express";
// import { productController } from "./product.controller";
// import validateRequest from "../../middlewares/validateRequest";
// import { productValidation } from "./product.validation";
// import auth from "../../middlewares/auth";
// import { USER_ROLES } from "../../../enums/user";

// const router = Router()

// router.post('/create', auth(USER_ROLES.ADMIN), validateRequest(productValidation.ProductValidationSchema), productController.createProduct)
// router.get('/', productController.getAllProducts)

// router.get('/:id', productController.getSingleProduct)
import { Router } from "express";
import { productController } from "./product.controller";
import validateRequest from "../../middlewares/validateRequest";
import { productValidation } from "./product.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import fileUploadHandler from "../../middlewares/fileUploadHandler";

const router = Router();

router.post(
    '/create',
    // auth(USER_ROLES.ADMIN),
    fileUploadHandler(),
    (req, res, next) => {
        // Extract file information
        const featureImage = req?.files['featureImage'] ? req?.files['featureImage'][0].path : null;
        const additionalImages = req?.files['additionalImages'] ? req?.files['additionalImages']?.map(file => file.path) : [];

        // Attach file paths to req.body
        req.body.featureImage = featureImage;
        req.body.additionalImages = additionalImages;

        next();
    },
    validateRequest(productValidation.ProductValidationSchema),
    productController.createProduct
);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getSingleProduct);

export const productRoute = router;
