import { Router } from "express";
import multer from 'multer';
const router = Router();
const upload = multer();


import * as controller from "../../controllers/admin/news.controller";
import * as uploadCloud from '../../middlewares/admin/uploadToCloudinary.middleware';


router.get('/index', controller.newsIndex);
router.get('/create', controller.newsCreate);
router.post('/create', upload.fields([
  {name:'img', maxCount:1}
]), uploadCloud.uploadFields, controller.newsCreatePost);

export const newsRoutes = router;
