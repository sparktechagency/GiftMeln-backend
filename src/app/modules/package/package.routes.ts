import express from 'express';
import { PackageController } from './package.controller';

const router = express.Router();

router.post('/create', PackageController.createPackage);
router.get('/check-trial', PackageController.checkUserTrial);


// 7-Day Free Trial
router.post('/start-trial', PackageController.startTrial);


// for product checkout routes
router.post('/checkout', PackageController.createOneTimePackage);
export const PackageRoutes = router;
