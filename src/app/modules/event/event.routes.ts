import express from 'express';
import { EventController } from './event.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  EventController.createEvent,
);
router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  EventController.getAllEvents,
);
router.get(
  '/user',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  EventController.getUserEvents,
);
router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  EventController.getSingleEvent,
);
router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  EventController.updateEvent,
);
// latest update event data
router.patch(
  '/edit/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  EventController.editEventFromDB,
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN),
  EventController.deleteEvent,
);
export const EventRoutes = router;
