import { Router } from 'express';
import multer from 'multer';
const route = Router();
const upload = multer();

import * as controller from '../../controllers/admin/part1.controller';
import * as uploadCloud from '../../middlewares/admin/uploadToCloudinary.middleware';

route.get('/sample/index', controller.indexSample);
route.get('/sample/detail/:slugSample', controller.detailSample);
route.get('/sample/edit/:slugSample', controller.editSample);
route.patch('/sample/edit/:slugSample', upload.fields([
  {name:'img', maxCount:1}
]), uploadCloud.uploadFields, controller.editSamplePatch);
route.get('/sample/create', controller.createSample);
route.post('/sample/create', upload.any(), uploadCloud.uploadAny, controller.createSamplePost);
route.delete('/sample/delete/:id', controller.deleteSample);

export const part1Routes: Router = route;