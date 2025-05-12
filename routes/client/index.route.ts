import { Express } from 'express';
import * as userMiddleware from '../../middlewares/client/auth.middleware';
import { dashboardRoutes } from './dashboard.route';
import { part1Routes } from './part1.route';
import { userRoutes } from './user.route';
import { part2Routes } from './part2.route';
import { searchRoutes } from './search.route';

const clientRoutes = (app: Express): void => {
  app.use(userMiddleware.requireAuth);
  
  app.use('/dashboard', dashboardRoutes);
  app.use('/part1', part1Routes);
  app.use('/user', userRoutes);
  app.use('/part2', part2Routes);
  app.use('/search', searchRoutes);
}

export default clientRoutes;