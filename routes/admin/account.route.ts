import { Router } from 'express';
import multer from 'multer';
const route = Router();
const upload = multer();

import * as controller from '../../controllers/admin/account.controller';
import * as validate from '../../validate/admin/user.validate';
import * as middleware from '../../middlewares/admin/auth.middleware';
import { uploadFields } from '../../middlewares/admin/uploadToCloudinary.middleware';


route.get('/login', controller.login);
route.post('/login', validate.loginPost, controller.loginPost);
route.get('/logout', middleware.requireLogin, controller.logout);
route.get('/detail/:id', middleware.requireLogin, controller.detail);
route.get('/edit/:id', middleware.requireLogin, controller.edit);
route.patch('/edit/:id', middleware.requireLogin, upload.fields([{name: 'avt', maxCount: 1}]), uploadFields, controller.editPatch);
route.post('/otp/:id', middleware.requireLogin, controller.otpPost);
route.post('/verify/:email', middleware.requireLogin, controller.verifyPost);
route.get('/forgot-password', controller.forgotPassword);
route.post('/forgot-password', controller.forgotPasswordPost);
route.get('/forgot-password/otp', controller.otpPassword);
route.post('/forgot-password/otp', controller.otpPasswordPost);
route.get('/forgot-password/reset', controller.resetPassword);
route.post('/forgot-password/reset', controller.resetPasswordPost);

export const accountRoutes = route;