import { Router } from 'express';
const route = Router();

import * as controller from '../../controllers/client/part1.controller';

route.get('/sample/:slugSample', controller.index);

export const part1Routes: Router = route;