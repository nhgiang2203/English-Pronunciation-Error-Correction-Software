import { Express } from 'express';
import { systemConfig } from '../../config/system';
import { dashboardRoutes } from './dashboard.route';
import { part1Routes } from './part1.route';
import { newsRoutes } from './news.route';
import { accountRoutes } from './account.route';
import * as middleware from '../../middlewares/admin/auth.middleware';

const adminRoutes = (app: Express): void => {
  const PATH_ADMIN = `/${systemConfig.prefixAdmin}`;

  app.use(PATH_ADMIN + '/dashboard', middleware.requireAuth, dashboardRoutes);
  app.use(PATH_ADMIN + '/part1', middleware.requireAuth, part1Routes);
  app.use(PATH_ADMIN + '/news', middleware.requireAuth, newsRoutes);
  app.use(PATH_ADMIN + '/account', accountRoutes);
}

export default adminRoutes;