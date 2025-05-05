import express, { Express } from 'express';
import dotenv from 'dotenv';
dotenv.config();

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
import passport from './config/passport';




database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(cookieParser('keyboard cat'));
app.use(session({cookie: {maxAge: 60000}}));
app.use(flash());

// parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// method-override
app.use(methodOverride("_method"));

// app local variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;

// admin routes
adminRoutes(app);

// client routes
clientRoutes(app);

// public
app.use(express.static(`${__dirname}/public`));

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

// TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

// End TinyMCE

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});