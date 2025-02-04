import express from 'express';
import { EventController } from './event.controller';

const router = express.Router();

router.get('/', EventController); 

export const EventRoutes = router;
