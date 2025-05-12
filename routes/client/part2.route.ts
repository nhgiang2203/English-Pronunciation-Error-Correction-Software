import { Router } from 'express';
const route = Router();

import * as controller from '../../controllers/client/part2.controller';
import * as middleware from '../../middlewares/client/auth.middleware';

route.get('/index', controller.index);
route.get('/detail/:slugTopic', middleware.requireLogin, controller.detail);

export const part2Routes: Router = route;