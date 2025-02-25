import express from 'express';
import { PackageController } from './package.controller';

const router = express.Router();

// Create a Package
router.post('/create', PackageController.createPackage);

// Get all available packages
router.get('/', PackageController.getAllPackages);

// Get details of a specific package by ID
router.get('/:id', PackageController.getPackageById);

// !Check if a user is eligible for a trial
router.get('/check-trial', PackageController.checkUserTrial);

// !Start a 7-Day Free Trial
router.post('/start-trial', PackageController.startTrial);

// !Checkout for a one-time package purchase
router.post('/checkout', PackageController.createOneTimePackage);


//! Subscribe to a Monthly or Yearly Package
router.post('/subscribe', PackageController.subscribeToPackage);

//! Cancel a Subscription
router.post('/cancel-subscription', PackageController.cancelSubscription);

//! Upgrade/Downgrade Subscription
// router.post('/change-subscription', PackageController.changeSubscription);

//! Get User's Active Subscription
router.get('/user-subscription/:userId', PackageController.getUserSubscription);

export const PackageRoutes = router;
