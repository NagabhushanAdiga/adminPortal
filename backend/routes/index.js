import { Router } from 'express';
import setupRoutes from './setupRoutes.js';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import importRoutes from './importRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import usersRoutes from './usersRoutes.js';
import * as healthController from '../controllers/healthController.js';

const router = Router();

router.get('/', (req, res) => res.json({ ok: true, message: 'Admin Portal API', docs: '/api/health' }));
router.get('/api/health', healthController.checkHealth);
router.use('/api', setupRoutes);
router.use('/api', authRoutes);
router.use('/api', dashboardRoutes);
router.use('/api', importRoutes);
router.use('/api', notificationRoutes);
router.use('/api', deviceRoutes);
router.use('/api', usersRoutes);

export default router;
