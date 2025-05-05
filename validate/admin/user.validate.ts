import { Request, Response, NextFunction } from 'express';
import { systemConfig } from '../../config/system';
export const loginPost = (req: Request, res: Response, next: NextFunction) => {
  if(!req.body.email){
    req.flash('error', 'Please enter the email!');
    res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
    return;
  }
  if(!req.body.password){
    req.flash('error', 'Please enter the password!');
    res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
    return;
  }
  next();
}