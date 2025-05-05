import { Router } from 'express';
import multer from 'multer';
const route = Router();
const upload = multer();

import passport from '../../config/passport';
import * as validate from '../../validate/user.validate';
import * as controller from '../../controllers/client/user.controller';
import { uploadFields } from '../../middlewares/admin/uploadToCloudinary.middleware';

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
route.get('/edit/:id', controller.edit);
route.patch('/edit/:id', upload.fields([{name: 'avt', maxCount: 1}]), uploadFields, controller.editPatch);
route.post('/otp/:id', controller.otpPost);
route.post('/verify/:email', controller.verifyPost);
route.post('/my-answer/:id', controller.myAnswerPost);

export const userRoutes: Router = route;