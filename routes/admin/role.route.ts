import { Router } from 'express';
const route = Router();

import * as controller from '../../controllers/admin/role.controller';

route.get('/', controller.index);
route.get('/create', controller.create);
route.post('/create', controller.createPost);
route.get('/detail/:id', controller.detail);
route.get('/edit/:id', controller.edit);
route.patch('/edit/:id', controller.editPatch);
route.delete('/delete/:id', controller.deleteRole);
route.get('/permissions', controller.permissions);
route.patch('/permissions', controller.permissionsPatch);

export const roleRoutes: Router = route;