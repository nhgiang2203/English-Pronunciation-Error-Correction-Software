import { Router } from 'express';
import * as controller from '../../controllers/client/search.controller';


const route: Router = Router();

route.get('/:type', controller.result);


export const searchRoutes: Router = route;