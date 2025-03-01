import { NextFunction, Request, Response, Router } from "express";
import { productController } from "./product.controller";
import validateRequest from "../../middlewares/validateRequest";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { getMultipleFilesPath, getSingleFilePath } from "../../../shared/getFilePath";
import { any } from "zod";

const router = Router();
router.post(
    '/create',
    fileUploadHandler(),
    async (req, res, next) => {
        try {
            const payload = req.body;
            const featureImage = getSingleFilePath(req.files, 'feature');
            const additionalImages = getMultipleFilesPath(req.files, 'additional');

            if (!featureImage) {
                return res.status(400).json({ message: "Feature image is required." });
            }

            req.body = {
                feature: featureImage, // Change from 'featureImage' to 'feature'
                additional: additionalImages,
                ...payload,
                color: parseArray(payload.color),
                tag: parseTag(payload.tag),
                size: parseArray(payload.size),
            };
            next();
        } catch (error) {
            res.status(500).json({ message: "Failed to upload Image" });
        }
    },
    productController.createProduct
);

const parseArray = (value: any) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsedValue = JSON.parse(value);
        return Array.isArray(parsedValue) ? parsedValue : [value];
    } catch {
        return value.includes(',') ? value.split(',').map((v: any) => v.trim()) : [value];
    }
};

// Parsing tag to ensure it's a flat array like ["fashion", "summer", "casual"]
const parseTag = (value: any) => {
    if (!value) return [];
    try {
        const parsedValue = JSON.parse(value);
        return Array.isArray(parsedValue) ? parsedValue : [value];
    } catch {
        return value.includes(',') ? value.split(',').map((v: any) => v.trim()) : [value];
    }
};

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getSingleProduct);

router.patch(
    '/update/:id',
    // @ts-ignore
    fileUploadHandler(),
    productController.updateProduct
);

export const productRoute = router;
