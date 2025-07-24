import express from 'express';
import { GiftCollectionController } from './giftcollection.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get(
  '/all',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  GiftCollectionController.getAllGift,
);
router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  GiftCollectionController.allGift,
);
router.get(
  '/user-history',
  auth(USER_ROLES.USER),
  GiftCollectionController.getAllGiftBaseOnUserAlsoStatusSend,
);

router.get(
  '/:category',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  GiftCollectionController.getProductBaseOnCtg,
);


router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  GiftCollectionController.updateGift,
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  GiftCollectionController.deleteGift,
);

export const GiftCollectionRoutes = router;
