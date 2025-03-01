import express from 'express';
import { EventController } from './event.controller';
import validateRequest from '../../middlewares/validateRequest';
import { eventValidation } from './event.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post('/create', EventController.createEvent);
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getSingleEvent);
router.patch("/:id", EventController.updateEvent);
router.delete("/:id", EventController.deleteEvent);
export const EventRoutes = router;
