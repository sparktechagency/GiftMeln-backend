import express from 'express';
import { FaqController } from './faq.controller';

const router = express.Router();

router.post('/create-faq', FaqController.createFaq);

router.get('/', FaqController.getAllFaq);
router.patch('/:id', FaqController.updateFaq);
router.delete('/:id', FaqController.deleteFaq);
export const FaqRoutes = router;
