import express from 'express';
import { PackageController } from './package.controller';

const router = express.Router();

router.get('/', PackageController); 

export const PackageRoutes = router;
