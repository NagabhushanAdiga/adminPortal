import { Router } from 'express';
import * as setupController from '../controllers/setupController.js';

const router = Router();

router.get('/setup', setupController.runSetup);

export default router;
