import { Router } from 'express';
const route = Router();

import * as controller from '../../controllers/admin/part2.controller';

route.get('/index', controller.index);
route.get('/create', controller.create);
route.post('/create', controller.createPost);
route.get('/edit/:slugTopic', controller.edit);
route.patch('/edit/:slugTopic', controller.editPatch);
route.get('/detail/:slugTopic', controller.detail);
route.delete('/delete/:id', controller.deleteTopic);

export const part2Routes: Router = route;