import { Router } from "express";
import multer from 'multer';
const router = Router();
const upload = multer();


import * as controller from "../../controllers/admin/dashboard.controller";
import * as uploadCloud from '../../middlewares/admin/uploadToCloudinary.middleware';
import * as middleware from '../../middlewares/admin/auth.middleware';

router.get('/', middleware.requireLogin, controller.index);
router.get('/userRegister', middleware.requireLogin, controller.userRegisterPerMonth);


export const dashboardRoutes = router;