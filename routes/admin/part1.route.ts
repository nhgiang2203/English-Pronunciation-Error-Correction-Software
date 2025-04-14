import { Router } from 'express';
const route = Router();

import * as controller from '../../controllers/admin/part1.controller';

route.get('/sample/index', controller.indexSample);

export const part1Routes: Router = route;