import { NextFunction, Request, Response, Router } from "express";
import { categoryController } from "./category.controller";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidation } from "./category.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { getSingleFilePath } from "../../../shared/getFilePath";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router()



// create category route
router.post("/create",
    // @ts-ignore
    fileUploadHandler(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { body, files } = req;
            const image = getSingleFilePath(files, "image");

            if (!image) {
                return res.status(400).json({ message: "Image is required" });
            }

            req.body = { image, ...body };
            next();
        } catch (error) {
            res.status(500).json({ message: "Failed to upload image" });
        }
    },
    validateRequest(CategoryValidation.createCategoryZodSchema),
    categoryController.createCategory
);


// update category 

router.patch("/:id",
    // @ts-ignore
    fileUploadHandler(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { body, files, params } = req;
            const image = getSingleFilePath(files, "image");

            if (image) {
                req.body = { ...req.body, image };
            }

            req.body = { ...req.body, id: params.id };
            next();
        } catch (error) {
            res.status(500).json({ message: "Failed to upload image" });
        }
    },
    validateRequest(CategoryValidation.updateCategoryZodSchema),
    categoryController.updateCategory
);


// get all categories

router.get("/", categoryController.getAllCategories);
// get single category

router.get("/:id", categoryController.getSingleCategory);

// delete category 
router.delete("/:id", auth(USER_ROLES.SUPER_ADMIN), categoryController.deleteCategory);

// export category routes
export const CategoryRoutes = router;