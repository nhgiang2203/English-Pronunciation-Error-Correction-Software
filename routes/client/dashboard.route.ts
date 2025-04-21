import { Router } from 'express';
const route = Router();

import * as controller from '../../controllers/client/dashboard.controller';

route.get('/', controller.index);
route.get('/news/:slugNews', controller.news);

export const dashboardRoutes: Router = route;