import { Express } from 'express';
import { systemConfig } from '../../config/system';
import { dashboardRoutes } from './dashboard.route';
import { part1Routes } from './part1.route';
import { newsRoutes } from './news.route';
import { accountRoutes } from './account.route';
import { part2Routes } from './part2.route';
import * as middleware from '../../middlewares/admin/auth.middleware';

const adminRoutes = (app: Express): void => {
  const PATH_ADMIN = `/${systemConfig.prefixAdmin}`;

  app.use(PATH_ADMIN + '/dashboard', middleware.requireAuth, middleware.requireLogin, dashboardRoutes);
  app.use(PATH_ADMIN + '/part1', middleware.requireAuth, middleware.requireLogin, part1Routes);
  app.use(PATH_ADMIN + '/news', middleware.requireAuth, middleware.requireLogin, newsRoutes);
  app.use(PATH_ADMIN + '/account', middleware.requireAuth, accountRoutes);
  app.use(PATH_ADMIN + '/part2', middleware.requireAuth, middleware.requireLogin, part2Routes);
}

export default adminRoutes;