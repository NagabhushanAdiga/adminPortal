import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/notifications_send', asyncHandler(notificationController.send));
router.get('/notifications_list', asyncHandler(notificationController.list));

export default router;
