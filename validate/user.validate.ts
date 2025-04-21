import { Request, Response, NextFunction } from 'express';

export const registerPost = (req: Request, res: Response, next: NextFunction) => {
  if(!req.body.username){
    req.flash('error', 'Please enter the username!');
    res.redirect('/user/register');
    return;
  }
  if(!req.body.email){
    req.flash('error', 'Please enter the email!');
    res.redirect('/user/register');
    return;
  }
  if(!req.body.password){
    req.flash('error', 'Please enter the password!');
    res.redirect('/user/register');
    return;
  }
  if(req.body.password !== req.body.confirmPassword){
    req.flash('error', 'Password do not match!');
    res.redirect('/user/register');
    return;
  }

  next();
}

export const loginPost = (req: Request, res: Response, next: NextFunction) => {
  if(!req.body.email){
    req.flash('error', 'Please enter the email!');
    res.redirect('/user/login');
    return;
  }
  if(!req.body.password){
    req.flash('error', 'Please enter the password!');
    res.redirect('/user/login');
    return;
  }
  next();
}

export const forgotPasswordPost = (req: Request, res: Response, next: NextFunction) => {
  if(!req.body.email){
    req.flash('error', 'Please enter the email!');
    res.redirect('/user/forgotPassword');
    return;
  }
  next();
}

export const resetPasswordPost = (req: Request, res: Response, next: NextFunction) => {
  if(!req.body.password){
    req.flash('error', 'Please enter the password!');
    res.redirect('/user/resetPassword');
    return;
  }
  if(!req.body.confirmPassword){
    req.flash('error', 'Please confirm the password!');
    res.redirect('/user/resetPassword');
    return;
  }
  if(req.body.password !== req.body.confirmPassword){
    req.flash('error', 'Password do not match!');
    res.redirect('/user/resetPassword');
    return;
  }
  next();
}
