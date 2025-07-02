import { Router } from 'express';
import multer from 'multer';
const route = Router();
const upload = multer();

import passport from '../../config/passport';
import * as validate from '../../validate/user.validate';
import * as controller from '../../controllers/client/user.controller';
import { uploadFields } from '../../middlewares/admin/uploadToCloudinary.middleware';
import * as middleware from '../../middlewares/client/auth.middleware';

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
route.get('/detail/:id', middleware.requireLogin, controller.detail);
route.get('/edit/:id', middleware.requireLogin, controller.edit);
route.patch('/edit/:id', middleware.requireLogin, upload.fields([{name: 'avt', maxCount: 1}]), uploadFields, controller.editPatch);
route.post('/otp/:id', middleware.requireLogin, controller.otpPost);
route.post('/verify/:email', middleware.requireLogin, controller.verifyPost);
route.post('/my-answer/:id', middleware.requireLogin, controller.myAnswerPost);
route.post('/isFollowing', middleware.requireLogin, controller.isFollowing);
route.get('/follower/:id', middleware.requireLogin, controller.follower);
route.get('/following/:id', middleware.requireLogin, controller.following);
route.get('/forgot-password', controller.forgotPassword);
route.post('/forgot-password', controller.forgotPasswordPost);
route.get('/forgot-password/otp', controller.otpPassword);
route.post('/forgot-password/otp', controller.otpPasswordPost);
route.get('/forgot-password/reset', controller.resetPassword);
route.post('/forgot-password/reset', controller.resetPasswordPost);

export const userRoutes: Router = route;