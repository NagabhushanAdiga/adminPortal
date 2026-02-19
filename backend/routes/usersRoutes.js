import { Router } from 'express';
import * as usersController from '../controllers/usersController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/users', asyncHandler(usersController.list));

export default router;
