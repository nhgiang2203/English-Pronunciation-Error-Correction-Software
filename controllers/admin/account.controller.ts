import { Request, Response } from 'express';
import md5 from 'md5';
import Account from '../../models/account.model';
import { systemConfig } from '../../config/system';

// GET /admin/account/login
export const login = (req: Request, res: Response) => {
  res.render('admin/pages/account/login', {
    pageTitle: 'Sign in'
  });
}

// POST /admin/account/login
export const loginPost = async(req: Request, res: Response) => {
  const account = await Account.findOne({
    email: req.body.email,
    deleted: false
  });


  if(!account){
    req.flash('error', 'Email not exist!');
    res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
    return;
  }

  if(md5(req.body.password) !== account.password){
    req.flash('error', 'Wrong password!');
    res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
    return;
  }

  if(account.status == 'inactive'){
    req.flash('error', 'Account has been locked!');
    res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
    return;
  }

  res.cookie('token', account.token);
  res.redirect(`/${systemConfig.prefixAdmin}/dashboard`);
}

// GET /admin/account/logout
export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
}