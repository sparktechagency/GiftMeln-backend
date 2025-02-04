import express from 'express';
import { EventController } from './event.controller';
import validateRequest from '../../middlewares/validateRequest';
import { eventValidation } from './event.validation';

const router = express.Router();

router.post('/create', EventController.createEvent);

export const EventRoutes = router;
