import { Router } from 'express';
import multer from 'multer';
const route = Router();
const upload = multer();

import * as controller from '../../controllers/admin/part1.controller';
import * as uploadCloud from '../../middlewares/admin/uploadToCloudinary.middleware';

route.get('/sample/index', controller.indexSample);
route.get('/sample/detail/:slugSample', controller.detailSample);
route.get('/sample/edit/:slugSample', controller.editSample);
route.patch('/sample/edit/:slugSample', upload.any(), uploadCloud.uploadAny, controller.editSamplePatch);
route.get('/sample/create', controller.createSample);
route.post('/sample/create', upload.any(), uploadCloud.uploadAny, controller.createSamplePost);
route.delete('/sample/delete/:id', controller.deleteSample);

route.get('/practice/index', controller.indexPractice);
route.get('/practice/detail/:slugPractice', controller.detailPractice);
route.get('/practice/edit/:slugPractice', controller.editPractice);
route.patch('/practice/edit/:slugPractice', upload.any(), uploadCloud.uploadAny, controller.editPracticePatch);
route.get('/practice/create', controller.createPractice);
route.post('/practice/create', upload.any(), uploadCloud.uploadAny, controller.createPracticePost);
route.delete('/practice/delete/:id', controller.deletePractice);

export const part1Routes: Router = route;