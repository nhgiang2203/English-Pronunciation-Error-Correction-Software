import { Router } from 'express';
const route = Router();

import * as controller from '../../controllers/admin/account.controller';
import * as validate from '../../validate/user.validate';

route.get('/login', controller.login);
route.post('/login', validate.loginPost, controller.loginPost);
route.get('/logout', controller.logout);

export const accountRoutes = route;