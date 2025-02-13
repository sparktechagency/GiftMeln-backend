import express from 'express';
import { PackageController } from './package.controller';

const router = express.Router();

router.post('/create', PackageController.createPackage);
router.get('/check-trial', PackageController.checkUserTrial);


export const PackageRoutes = router;
