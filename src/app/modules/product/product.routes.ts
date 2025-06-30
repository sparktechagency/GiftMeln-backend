import { NextFunction, Request, Response, Router } from 'express';
import { productController } from './product.controller';
import csv from 'csvtojson';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../../../shared/getFilePath';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { IProduct } from './product.interface';
import { productParse } from './product.parse';

const router = Router();
router.post(
  '/bulk-create',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  fileUploadHandler(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let people: IProduct[] = [];

      // If CSV file exists in the request
      if (req.files && 'csv' in req.files && req.files.csv[0]) {
        // Read CSV data
        people = await csv().fromFile(req.files.csv[0].path);

        // Transform CSV data into required format
        const transformedPeople = people.map(person => ({
          ...person,
          size: productParse(person.size), // Parsing size field
          color: productParse(person.color), // Parsing color field
          tag: productParse(person.tag), // Parsing tag field
          additional: productParse(person.additional), // Parsing additional field
        }));

        // Attach transformed data to request body
        req.body = { people: transformedPeople };
      } else {
        // Handle case if CSV file is not provided
        return res.status(400).json({ message: 'CSV file is required.' });
      }

      // Continue to the next middleware/controller
      next();
    } catch (error) {
      return res.status(500).json({
        message: 'An error occurred while processing the CSV file.',
      });
    }
  },
  // Call the controller function to create products in the DB
  productController.createBulkProduct,
);

router.post(
  '/create',
  auth(USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  async (req, res, next) => {
    try {
      const payload = req.body;
      const featureImage = getSingleFilePath(req.files, 'feature');
      const additionalImages = getMultipleFilesPath(req.files, 'additional');

      if (!featureImage) {
        return res.status(400).json({ message: 'Feature image is required.' });
      }

      req.body = {
        feature: featureImage,
        additional: additionalImages,
        ...payload,
        color: parseArray(payload.color),
        tag: parseTag(payload.tag),
        size: parseArray(payload.size),
      };
      next();
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload Image' });
    }
  },
  productController.createProduct,
);

const parseArray = (value: any) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : [value];
  } catch {
    return value.includes(',')
      ? value.split(',').map((v: any) => v.trim())
      : [value];
  }
};

// Parsing tag to ensure it's a flat array like ["fashion", "summer", "casual"]
const parseTag = (value: any) => {
  if (!value) return [];
  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : [value];
  } catch {
    return value.includes(',')
      ? value.split(',').map((v: any) => v.trim())
      : [value];
  }
};
// * shopify
router.get(
  '/search',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
  productController.shopifyProduct,
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
  productController.getAllProducts,
);
router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  productController.getSingleProduct,
);
// * shopify
router.get('/shopify/:id', productController.getSingleShopifyProduct);

router.patch(
  '/update/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  // @ts-ignore
  fileUploadHandler(),
  productController.updateProduct,
);
// product details update
router.patch(
  '/productDetails/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  fileUploadHandler(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      const featureImage = getSingleFilePath(req.files, 'feature');
      const additionalImages = getMultipleFilesPath(req.files, 'additional');

      if (!featureImage) {
        return res.status(400).json({ message: 'Feature image is required.' });
      }

      req.body = {
        feature: featureImage,
        additional: additionalImages,
        ...payload,
        color: parseArray(payload.color),
        tag: parseTag(payload.tag),
        size: parseArray(payload.size),
      };
      next();
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload Image' });
    }
  },

  productController.updateProductFromDBController,
);

// delete product
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  productController.deleteProduct,
);

export const productRoute = router;
