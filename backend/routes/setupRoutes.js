import { Router } from 'express';
import * as setupController from '../controllers/setupController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/setup', asyncHandler(setupController.runSetup));

export default router;
