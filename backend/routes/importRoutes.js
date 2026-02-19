import { Router } from 'express';
import * as importController from '../controllers/importController.js';

const router = Router();

router.post('/import_save', importController.save);
router.get('/import_list', importController.list);

export default router;
