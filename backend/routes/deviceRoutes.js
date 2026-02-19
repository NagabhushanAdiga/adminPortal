import { Router } from 'express';
import * as deviceController from '../controllers/deviceController.js';

const router = Router();

router.post('/register_device', deviceController.register);

export default router;
