import { Router } from 'express';
import multer from 'multer';
const route = Router();
const upload = multer();

import * as controller from '../../controllers/admin/accounts.controller';
import { uploadFields } from '../../middlewares/admin/uploadToCloudinary.middleware';
import * as validate from '../../validate/admin/accounts.validate';

route.get('/', controller.index);
route.get('/create', controller.create);
route.post('/create', upload.fields([{name: 'avatar', maxCount: 1}]), uploadFields, validate.createPost, controller.createPost);
route.get('/edit/:id', controller.edit);
route.get('/detail/:id', controller.detail);
route.patch('/edit/:id', upload.fields([{name: 'avatar', maxCount: 1}]), uploadFields, validate.editPatch, controller.editPatch);
route.delete('/delete/:id', controller.deleteAccounts);

export const accountsRoutes: Router = route;