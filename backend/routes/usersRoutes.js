import { Router } from 'express';
import * as usersController from '../controllers/usersController.js';

const router = Router();
router.get('/users', usersController.list);

export default router;
