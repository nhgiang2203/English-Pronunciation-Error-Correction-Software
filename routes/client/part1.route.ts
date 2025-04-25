import { Router } from 'express';
const route = Router();

import * as controller from '../../controllers/client/part1.controller';
import * as middleware from '../../middlewares/client/auth.middleware';

route.get('/index', controller.index);
route.get('/sample/:slugSample', controller.indexSample);
route.get('/practice/:slugPractice', middleware.requireLogin, controller.indexPractice);

export const part1Routes: Router = route;