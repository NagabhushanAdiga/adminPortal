import { Router } from 'express';
import * as deviceController from '../controllers/deviceController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register_device', asyncHandler(deviceController.register));

export default router;
