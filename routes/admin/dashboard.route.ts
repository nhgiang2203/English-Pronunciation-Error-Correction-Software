import { Router } from "express";
import multer from 'multer';
const router = Router();
const upload = multer();


import * as controller from "../../controllers/admin/dashboard.controller";
import * as uploadCloud from '../../middlewares/admin/uploadToCloudinary.middleware';


router.get('/', controller.index);


export const dashboardRoutes = router;