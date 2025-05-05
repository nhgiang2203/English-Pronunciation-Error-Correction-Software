import { Request, Response } from 'express';
import User from '../../models/user.model';
import md5 from 'md5';
import * as generate from '../../helper/generate';
import * as helper from '../../helper/sendMail';
import ConfirmEmail from '../../models/email-confirm.model';
import MyAnswer from '../../models/my-answer.model';

//GET /login
export const login = (req: Request, res: Response) => {
  const redirectUrl = req.query.redirect || '/dashboard';
  res.render('client/pages/user/login', {
    pageTitle: 'Log in',
    redirect: redirectUrl,
  });
}


//POST /login
export const loginPost = async(req: Request, res: Response) => {
  const user = await User.findOne({
    email: req.body.email,
    deleted: false
  });

  if (!user){
    req.flash('error', 'Email does not exist!');
    res.redirect('/user/login');
    return;
  }
  if(md5(req.body.password) != user.password){
    req.flash('error', 'Wrong password!');
    res.redirect('/user/login');
    return;
  }
  if(user.status == 'inactive'){
    req.flash('error', 'The account has been locked!');
    res.redirect('/user/login');
    return;
  }

  res.cookie('tokenUser', user.tokenUser);
  const redirectUrl = req.body.redirect || '/dashboard';
  console.log(redirectUrl);
  res.redirect(redirectUrl);

}

// login bằng google
export const googleCallback = (req: Request, res: Response) => {
  const user = req.user as any;
  res.cookie('tokenUser', user.tokenUser);
  req.flash('success', 'Logged in with Google successfully!');

  const redirectUrl = req.query.state || '/dashboard'; // dùng state thay vì redirect
  console.log('Google redirect:', redirectUrl);
  res.redirect(redirectUrl as string);
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

// GET /detail
export const detail = async(req: Request, res: Response) => {
  const user = await User.findOne({
    _id: req.params.id,
    deleted: false,
    status: 'active'
  });

  const answerUser = await MyAnswer.find({
    userId: req.params.id,
    deleted: false
  });

  user['answers'] = answerUser;

  res.render('client/pages/user/detail', {
    pageTitle: 'Detail',
    user: user
  })
}

// GET /edit/:id
export const edit = async(req: Request, res: Response) => {
  const user = await User.findOne({
    _id: req.params.id,
    status: 'active',
    deleted: false
  });

  res.render('client/pages/user/edit', {
    pageTitle: 'Settings',
    user: user
  });
}

// POST /edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      deleted: false,
      status: 'active'
    });

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect(`/user/edit/${req.params.id}`);
    }

    const tab = req.body.tab || req.query.tab;

    if (tab === 'account-general') {
      let verify = user.verify;
      let avt = user.avatar;

      if(req.body.avt && req.body.avt.length > 0){
        avt = req.body.avt[0];
      }

      if (req.body.username !== user.username) {
        const usernameExist = await User.findOne({
          username: req.body.username,
          deleted: false,
          _id: { $ne: user._id }
        });
        if (usernameExist) {
          req.flash('error', 'Username existed!');
          return res.redirect(`/user/edit/${user.id}?tab=account-general`);
        }
      }

      if (req.body.email !== user.email) {
        const emailExist = await User.findOne({
          email: req.body.email,
          deleted: false,
          _id: { $ne: user._id }
        });
        if (emailExist) {
          req.flash('error', 'Email existed!');
          return res.redirect(`/user/edit/${user.id}?tab=account-general`);
        } else {
          verify = false;
        }
      }

      if (req.body.phone !== user.phone) {
        const phoneExist = await User.findOne({
          phone: req.body.phone,
          deleted: false,
          _id: { $ne: user._id }
        });
        if (phoneExist) {
          req.flash('error', 'Phone existed!');
          return res.redirect(`/user/edit/${user.id}?tab=account-general`);
        }
      }

      const userData = {
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        avatar: avt,
        address: req.body.address,
        slogan: req.body.slogan,
        verify: verify
      };

      await User.updateOne({ _id: user.id }, userData);
      req.flash('success', 'Update successfully!');
      return res.redirect(`/user/edit/${user.id}?tab=account-general`);
    }

    if (tab === 'account-change-password') {
      const { password, newPassword, confirmPassword } = req.body;

      if (md5(password) !== user.password) {
        req.flash('error', 'Current password is incorrect');
        return res.redirect(`/user/edit/${user.id}?tab=account-change-password`);
      }
      if (newPassword !== confirmPassword) {
        req.flash('error', 'Passwords do not match');
        return res.redirect(`/user/edit/${user.id}?tab=account-change-password`);
      }

      await User.updateOne({ _id: user.id }, { password: md5(newPassword) });
      req.flash('success', 'Password updated successfully');
      return res.redirect(`/user/edit/${user.id}?tab=account-change-password`);
    }

    if (tab === 'account-social-links') {
      const userData = {
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        instagram: req.body.instagram
      };
      await User.updateOne({ _id: user.id }, userData);
      req.flash('success', 'Social links updated successfully');
      return res.redirect(`/user/edit/${user.id}?tab=account-social-links`);
    }

    // fallback
    res.redirect(`/user/edit/${user.id}`);

  } catch (error) {
    console.error(error);
    req.flash('error', 'Update failed');
    return res.redirect(`/user/edit/${req.params.id}`);
  }
};


// POST /user/otp
export const otpPost = async(req: Request, res: Response) => {
  const id = req.params.id;
  const email = req.body.email;
  const user = await User.findOne({
    email: email,
    deleted: false,
    status: 'active'
  });

  if(!user){
    res.json({
      code: 400,
      success: false
    });
    return
  }

  const otp = generate.generateRandomNumber(6);
  const dataConfirmEmail = {
    email: email,
    otp: otp,
    expireAt: Date.now()
  };

  const objectConfirmEmail = new ConfirmEmail(dataConfirmEmail);
  await objectConfirmEmail.save();

  const subject = 'Mã OTP xác minh';
  const html = `Mã OTP xác minh là <b>${otp}</b>. Thời hạn sử dụng là 3 phút`;
  helper.sendEmail(email, subject, html);

  res.json({
    code: 200,
    success: true
  });
}

// POST /user/verify/email
export const verifyPost = async(req: Request, res: Response) => {
  const email = req.params.email;
  const otp = req.body.otp;
  console.log(otp);

  const user = await ConfirmEmail.findOne({
    email: email,
    otp: otp
  });

  console.log(user);

  if(!user){
    res.json({
      code: 400,
      success: false
    });
    return;
  }

  if(user){
    const verifyUser = await User.findOne({
      email: email,
      deleted: false,
      status: 'active'
    });

    await User.updateOne({_id: verifyUser.id}, {verify: true});
    res.json({
      code: 200,
      success: true
    });
  }
}

// POST /user/my-answer/:id
export const myAnswerPost = async(req: Request, res: Response) => {
  const user = await User.findOne({
    _id: req.params.id,
    deleted: false
  });

  const myAnswer = req.body; 
  console.log(myAnswer);

  if(!myAnswer){
    return res.json({
      code: 400,
      success: false
    });
  }

  const myAnswerData = {
    userId: req.params.id,
    topic: myAnswer.topic,
    question: myAnswer.questionText,
    answer: myAnswer.answerText,
    pronunciationData: myAnswer.pronunciationData,
    suggestData: myAnswer.suggestData
  };

  const myAnswerNew = new MyAnswer(myAnswerData);
  await myAnswerNew.save();

  res.json({
    code: 200,
    success: true
  });
};


