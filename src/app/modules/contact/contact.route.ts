import express from 'express';
import { ContactController } from './contact.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post('/send', ContactController.emailController);
router.get("/", auth(USER_ROLES.ADMIN), ContactController.getAllContacts);

export const ContactRoutes = router;
