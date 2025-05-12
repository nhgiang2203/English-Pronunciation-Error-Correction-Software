import { Router } from "express";
import multer from 'multer';
const router = Router();
const upload = multer();


import * as controller from "../../controllers/admin/news.controller";
import * as uploadCloud from '../../middlewares/admin/uploadToCloudinary.middleware';
import * as middleware from '../../middlewares/admin/auth.middleware';


router.get('/index', controller.newsIndex);
router.get('/create', controller.newsCreate);
router.post('/create', upload.fields([
  {name:'img', maxCount:1}
]), uploadCloud.uploadFields, controller.newsCreatePost);
router.get('/detail/:slugNews', controller.detail);
router.get('/edit/:slugNews', controller.edit);
router.patch('/edit/:slugNews', upload.fields([
  {name:'img', maxCount:1}
]), uploadCloud.uploadFields, controller.editPatch);
router.delete('/delete/:id', controller.deleteNew);
export const newsRoutes = router;
