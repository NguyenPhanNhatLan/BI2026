import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
const dashboardRouter = Router();

dashboardRouter.get('/otif-summary', getDashboardData);

export default dashboardRouter;