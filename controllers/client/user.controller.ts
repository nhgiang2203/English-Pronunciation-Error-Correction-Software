import { Request, Response } from 'express';
import User from '../../models/user.model';
import md5 from 'md5';

//GET /login
export const login = (req: Request, res: Response) => {
  res.render('client/pages/user/login', {
    pageTitle: 'Log in'
  });
}

//POST /login
export const loginPost = async(req: Request, res: Response) => {
  const user = await User.findOne({
    email: req.body.email,
    deleted: false
  });

  console.log(req.body.email);
  console.log('Referer:', req.get('referer'));

  console.log('Success message:', req.flash('success'));
  console.log('Error message:', req.flash('error'));

  if (!user){
    req.flash('error', 'Email does not exist!');
    res.redirect('/user/login');
    return;
  }
  if(md5(req.body.password) != user.password){
    req.flash('error', 'Wrong password!');
    res.redirect('back');
    return;
  }
  if(user.status == 'inactive'){
    req.flash('error', 'The account has been locked!');
    res.redirect('back');
    return;
  }

  res.cookie('tokenUser', user.tokenUser);
  res.redirect('/');
}

// login bằng google
export const googleCallback = (req: Request, res: Response) => {
  const user = req.user as any;
  res.cookie('tokenUser', user.tokenUser);
  req.flash('success', 'Logged in with Google successfully!');
  res.redirect('/dashboard');
}

// GET /register
export const register = (req: Request, res: Response) => {
  res.render('client/pages/user/register', {
    pageTitle: 'Register'
  });
}

// POST /register
export const registerPost = async(req: Request, res: Response) => {
  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false
  });
  if(existEmail){
    req.flash('error', 'Email exist!');
    res.redirect('/user/register');
    return;
  }

  const existUsername = await User.findOne({
    username: req.body.username,
    deleted: false
  });
  if(existUsername){
    req.flash('error', 'Username exist!');
    res.redirect('/user/register');
    return;
  }
  req.body.password = md5(req.body.password);
  const user = new User(req.body);
  user.save();
  res.cookie('tokenUser', user.tokenUser);
  res.redirect('/dashboard');
  
}

// GET /logout
export const logout = (req: Request, res: Response) => {
  res.clearCookie('tokenUser');
  res.redirect('/dashboard');
}