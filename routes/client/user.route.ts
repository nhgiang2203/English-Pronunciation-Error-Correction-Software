import { Router } from 'express';
const route = Router();

import passport from '../../config/passport';
import * as validate from '../../validate/user.validate';
import * as controller from '../../controllers/client/user.controller';

route.get('/login', controller.login);
route.post('/login', validate.loginPost, controller.loginPost);
// Google login
// route.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// Google login với redirect (state)
route.get('/auth/google', (req, res, next) => {
  const redirect = req.query.redirect || '/dashboard';

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: redirect as string, // truyền redirect qua state
  })(req, res, next);
});

// Google callback
route.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/user/login' }),
  controller.googleCallback
);

route.get('/register', controller.register);
route.post('/register', validate.registerPost, controller.registerPost);
route.get('/logout', controller.logout);
route.get('/detail/:id', controller.detail);

export const userRoutes: Router = route;