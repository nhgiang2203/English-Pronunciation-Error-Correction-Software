import { Express } from 'express';
import { dashboardRoutes } from './dashboard.route';
import { part1Routes } from './part1.route';

const clientRoutes = (app: Express): void => {
  app.use('/dashboard', dashboardRoutes);
  app.use('/part1', part1Routes);
}

export default clientRoutes;