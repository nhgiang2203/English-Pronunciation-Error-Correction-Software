import { Express } from 'express';
import { systemConfig } from '../../config/system';
import { dashboardRoutes } from './dashboard.route';
import { part1Routes } from './part1.route';
import { newsRoutes } from './news.route';

const adminRoutes = (app: Express): void => {
  const PATH_ADMIN = `/${systemConfig.prefixAdmin}`;

  app.use(PATH_ADMIN + '/dashboard', dashboardRoutes);
  app.use(PATH_ADMIN + '/part1', part1Routes);
  app.use(PATH_ADMIN + '/news', newsRoutes);
}

export default adminRoutes;