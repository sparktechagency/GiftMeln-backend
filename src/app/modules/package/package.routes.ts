import express from 'express';
import { PackageController } from './package.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// Create a Package
router.post('/create', auth(USER_ROLES.SUPER_ADMIN), PackageController.createPackage);

// Get all available packages
router.get('/', auth(USER_ROLES.SUPER_ADMIN), PackageController.getAllPackages);



// !Check if a user is eligible for a trial
router.get('/check-trial', PackageController.checkUserTrial);

// !Start a 7-Day Free Trial
router.post('/start-trial', PackageController.startTrial);

// !Checkout for a one-time package purchase
router.post('/checkout', PackageController.createOneTimePackage);


//! Subscribe to a Monthly or Yearly Package
router.post('/subscribe', PackageController.subscribeToPackage);

//! Cancel a Subscription
// router.post('/cancel-subscription', PackageController.cancelSubscription);

//! Upgrade/Downgrade Subscription
// router.post('/change-subscription', PackageController.changeSubscription);

//! Get User's Active Subscription
// get all subscriptions from user
router.get("/all-subscriptions", auth(USER_ROLES.SUPER_ADMIN), PackageController.getAllSubscription);
router.get('/user-subscription/:userId', PackageController.getUserSubscription);
// Get details of a specific package by ID
router.get('/:id', PackageController.getPackageById);



export const PackageRoutes = router;
