import { Router } from 'express';
const route = Router();

import * as controller from '../../controllers/client/part1.controller';

route.get('/sample/:slugSample', controller.indexSample);
route.get('/practice/:slugPractice', controller.indexPractice);

export const part1Routes: Router = route;