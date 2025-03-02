import express from 'express';
import { EventController } from './event.controller';
import validateRequest from '../../middlewares/validateRequest';
import { eventValidation } from './event.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post('/create', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), EventController.createEvent);
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), EventController.getAllEvents);
router.get('/:id', auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), EventController.getSingleEvent);
router.patch("/:id", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), EventController.updateEvent);
router.delete("/:id", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), EventController.deleteEvent);
export const EventRoutes = router;
