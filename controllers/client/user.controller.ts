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
    pageTitle: 'Đăng nhập',
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
    req.flash('error', 'Email không tồn tại!');
    res.redirect('/user/login');
    return;
  }
  if(md5(req.body.password) != user.password){
    req.flash('error', 'Sai mật khẩu!');
    res.redirect('/user/login');
    return;
  }
  if(user.status == 'inactive'){
    req.flash('error', 'Tài khoản đã bị khóa!');
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
  req.flash('success', 'Đăng nhập thành công!');

  const redirectUrl = req.query.state || '/dashboard'; // dùng state thay vì redirect
  console.log('Google redirect:', redirectUrl);
  res.redirect(redirectUrl as string);
}



// GET /register
export const register = (req: Request, res: Response) => {
  res.render('client/pages/user/register', {
    pageTitle: 'Đăng kí'
  });
}

// POST /register
export const registerPost = async(req: Request, res: Response) => {
  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false
  });
  if(existEmail){
    req.flash('error', 'Email tồn tại!');
    res.redirect('/user/register');
    return;
  }

  const existUsername = await User.findOne({
    username: req.body.username,
    deleted: false
  });
  if(existUsername){
    req.flash('error', 'Username tồn tại!');
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
  }).sort({ createdAt: -1 });

  user['answers'] = answerUser;
  const lenAnswer = answerUser.length;
  const lenFollower = user.follower.length;
  const lenFollowing = user.following.length;

  let isOwnProfile = false;
  const token = req.cookies.tokenUser;
  const own = await User.findOne({
    tokenUser: token,
    deleted: false
  });

  if(req.params.id === own.id){
    isOwnProfile = true;
  }

  const isFollowing = own.following.includes(user.id);
  console.log(user.id);
  console.log(isFollowing);


  res.render('client/pages/user/detail', {
    pageTitle: user.username,
    user: user,
    isOwnProfile,
    lenAnswer,
    lenFollower,
    lenFollowing,
    isFollowing
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
    pageTitle: 'Cài đặt',
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
      req.flash('error', 'Người dùng không tồn tại!');
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
          req.flash('error', 'Tên người dùng tồn tại!');
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
          req.flash('error', 'Email tồn tại!');
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
          req.flash('error', 'Số điện thoại tồn tại!');
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
      req.flash('success', 'Cập nhật thành công!');
      return res.redirect(`/user/edit/${user.id}?tab=account-general`);
    }

    if (tab === 'account-change-password') {
      const { password, newPassword, confirmPassword } = req.body;

      if (md5(password) !== user.password) {
        req.flash('error', 'Mật khẩu hiện tại không đúng!');
        return res.redirect(`/user/edit/${user.id}?tab=account-change-password`);
      }
      if (newPassword !== confirmPassword) {
        req.flash('error', 'Mật khẩu không khớp!');
        return res.redirect(`/user/edit/${user.id}?tab=account-change-password`);
      }

      await User.updateOne({ _id: user.id }, { password: md5(newPassword) });
      req.flash('success', 'Đổi mật khẩu thành công!');
      return res.redirect(`/user/edit/${user.id}?tab=account-change-password`);
    }

    if (tab === 'account-social-links') {
      const userData = {
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        instagram: req.body.instagram
      };
      await User.updateOne({ _id: user.id }, userData);
      req.flash('success', 'Cập nhật mạng xã hội thành công!');
      return res.redirect(`/user/edit/${user.id}?tab=account-social-links`);
    }

    // fallback
    res.redirect(`/user/edit/${user.id}`);

  } catch (error) {
    console.error(error);
    req.flash('error', 'Cập nhật thất bại!');
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
  console.log(otp);
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


//POST /user/isFollowing
export const isFollowing = async(req: Request, res: Response) => {
  const userIdFl = req.body.userIdFollow;
  const token = req.cookies.tokenUser;
  const user = await User.findOne({
    tokenUser: token,
    deleted: false
  });

  const existFl = user.following.includes(userIdFl);
  if(existFl){
    await User.findByIdAndUpdate(user.id, { $pull: { following: userIdFl } });
    await User.findByIdAndUpdate(userIdFl, { $pull: { follower: user.id } });
    return res.json({ nowFollowing: false });
  }else {
    // Thêm follow
    await User.findByIdAndUpdate(user.id, { $addToSet: { following: userIdFl } });
    await User.findByIdAndUpdate(userIdFl, { $addToSet: { follower: user.id } });
    return res.json({ nowFollowing: true });
  }
}

//GET /user/follower/:id
export const follower = async(req: Request, res: Response) => {
  const id = req.params.id;
  const user = await User.findOne({
    _id: id,
    status: 'active',
    deleted: false
  });
  if(!user){
    req.flash('error', 'Người dùng không tồn tại!');
    res.redirect('/dashboard');
    return;
  }

  const listFl = user.follower;
  const follower = await Promise.all(
    listFl.map(async(fl) => {
      return await User.findOne({
        _id: fl,
        status: 'active',
        deleted: false
      }, 'username avatar');
    })
  )

  const followers = follower.filter(f => f);

  res.render('client/pages/user/follower', {
    pageTitle: 'Người theo dõi',
    followers: followers
  })
}

//GET /user/following/:id
export const following = async(req: Request, res: Response) => {
  const id = req.params.id;
  const user = await User.findOne({
    _id: id,
    status: 'active',
    deleted: false
  });
  if(!user){
    req.flash('error', 'Người dùng không tồn tại!');
    res.redirect('/dashboard');
    return;
  }

  const listFl = user.following;
  const following = await Promise.all(
    listFl.map(async(fl) => {
      return await User.findOne({
        _id: fl,
        status: 'active',
        deleted: false
      }, 'username avatar');
    })
  )

  const followings = following.filter(f => f);

  res.render('client/pages/user/following', {
    pageTitle: 'Đang theo dõi',
    followings: followings
  })
}

//GET /user/forgot-password
export const forgotPassword = (req: Request, res: Response) => {
  res.render('client/pages/user/forgot-password', {
      pageTitle: 'Lấy lại mật khẩu'
  })
}

//POST user/forgot-password
export const forgotPasswordPost = async(req: Request, res: Response) => {
  const email = req.body.email;
  const user = await User.findOne({
    email: email,
    deleted: false,
    status: 'active'
  });

  if(!user){
    req.flash('error', 'Email không tồn tại!');
    res.redirect('/user/login');
    return;
  }
  if(user.googleId !== null){
    req.flash('error', 'Email không thể đổi mật khẩu!');
    res.redirect('/user/login');
    return;
  }

  const otp = generate.generateRandomNumber(6);
  console.log(otp);
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

  res.redirect(`/user/forgot-password/otp?email=${email}`);
}

//GET /user/forgot-password/otp
export const otpPassword = (req: Request, res: Response) => {
  const email = req.query.email;

  res.render('client/pages/user/otp-password', {
      pageTitle: 'Nhập mã OTP',
      email: email
  });
}

//POST /user/forgot-password/otp
export const otpPasswordPost = async(req: Request, res: Response) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ConfirmEmail.findOne({
      email: email,
      otp: otp
  });

  if(!result){
      req.flash('error', 'OTP không hợp lệ');
      res.redirect('/user/forgot-password/otp');
      return;
  }

  const user = await User.findOne({
      email: email
  });
  res.cookie("tokenUser", user.tokenUser);

  res.redirect('/user/forgot-password/reset');
}

//GET /user/forgot-password
export const resetPassword = (req: Request, res: Response) => {
  res.render('client/pages/user/reset-password', {
      pageTitle: 'Nhập lại mật khẩu',
  });
}

//[POST]/user/forgot-password/reset
export const resetPasswordPost = async(req: Request, res: Response) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  if(password !== confirmPassword){
    req.flash('error', 'Mật khẩu không trùng khớp!');
    res.redirect('/user/forgot-password/reset');
    return;
  }
  
  const tokenUser = req.cookies.tokenUser;
  await User.updateOne({
      tokenUser: tokenUser
  }, {
      password: md5(password)
  });

  res.redirect('/dashboard/');
}