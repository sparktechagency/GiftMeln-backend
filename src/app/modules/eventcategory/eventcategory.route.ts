import express from 'express';
import { EventCategoryController } from './eventcategory.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  EventCategoryController.createEventCategory,
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  EventCategoryController.getAllEventCategory,
);

router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  EventCategoryController.getSingleEventCategory,
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  EventCategoryController.deleteSingleEventCategory,
);

export const EventCategoryRoutes = router;
