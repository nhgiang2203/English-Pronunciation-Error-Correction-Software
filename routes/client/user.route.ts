import { Router } from 'express';
const route = Router();

import passport from '../../config/passport';
import * as validate from '../../validate/user.validate';
import * as controller from '../../controllers/client/user.controller';

route.get('/login', controller.login);
route.post('/login', controller.loginPost);
// Google login
route.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback
route.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/user/login' }),
  controller.googleCallback
);

route.get('/register', controller.register);
route.post('/register', validate.registerPost, controller.registerPost);
route.get('/logout', controller.logout);

export const userRoutes: Router = route;