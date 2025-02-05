import express from 'express';
import { EventController } from './event.controller';
import validateRequest from '../../middlewares/validateRequest';
import { eventValidation } from './event.validation';

const router = express.Router();

router.post('/create', EventController.createEvent);
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getSingleEvent);
router.patch("/:id", EventController.updateEvent);
router.delete("/:id", EventController.deleteEvent);
export const EventRoutes = router;
