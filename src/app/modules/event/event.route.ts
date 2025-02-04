import express from 'express';
import { EventController } from './event.controller';

const router = express.Router();

router.get('/create', EventController.createEvent);

export const EventRoutes = router;
