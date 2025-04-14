import express, { Express } from 'express';
import dotenv from 'dotenv';
import moment from 'moment';
import bodyParser from 'body-parser';
import path from "path";
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'express-flash';

import * as database from './config/database';
import { systemConfig } from './config/system';
import adminRoutes from './routes/admin/index.route';
import clientRoutes from './routes/client/index.route';



dotenv.config();
database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

// Flash
app.use(cookieParser('keyboard cat'));
app.use(session({cookie: {maxAge: 60000}}));
app.use(flash());

// parser
app.use(bodyParser.urlencoded({extended: false}));

// method-override
app.use(methodOverride("_method"));

// app local variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// admin routes
adminRoutes(app);

// client routes
clientRoutes(app);

// public
app.use(express.static(`${__dirname}/public`));

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});