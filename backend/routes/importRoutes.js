import { Router } from 'express';
import * as importController from '../controllers/importController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/import_save', asyncHandler(importController.save));
router.get('/import_list', asyncHandler(importController.list));

export default router;
