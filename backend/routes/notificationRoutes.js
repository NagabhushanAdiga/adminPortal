import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();

router.post('/notifications_send', notificationController.send);
router.get('/notifications_list', notificationController.list);

export default router;
