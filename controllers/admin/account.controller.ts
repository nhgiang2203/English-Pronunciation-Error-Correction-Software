import { Request, Response } from 'express';
import md5 from 'md5';
import Account from '../../models/account.model';
import ConfirmEmail from '../../models/email-confirm.model';
import Role from '../../models/role.model';
import { systemConfig } from '../../config/system';
import * as generate from '../../helper/generate';
import * as helper from '../../helper/sendMail';

// GET /admin/account/login
export const login = (req: Request, res: Response) => {
  res.render('admin/pages/account/login', {
    pageTitle: 'Đăng nhập'
  });
}

// POST /admin/account/login
export const loginPost = async(req: Request, res: Response) => {
  const account = await Account.findOne({
    email: req.body.email,
    deleted: false
  });


  if(!account){
    req.flash('error', 'Email không tồn tại!');
    res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
    return;
  }

  if(md5(req.body.password) !== account.password){
    req.flash('error', 'Sai mật khẩu!');
    res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
    return;
  }

  if(account.status == 'inactive'){
    req.flash('error', 'Tài khoản đã bị khóa!');
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

//GET /admin/account/detail
export const detail = async(req: Request, res: Response) => {
  const account = await Account.findOne({
    _id: req.params.id,
    status: 'active',
    deleted: false
  });

  const role = await Role.findOne({
    _id: account.role_id,
    deleted: false
  });

  account['role'] = role.title;
  res.render('admin/pages/account/detail',{
    pageTitle: account.username,
    account: account
  })
}

//GET /admin/edit/:id
export const edit = async(req: Request, res: Response) => {
  const account = await Account.findOne({
    _id: req.params.id,
    status: 'active',
    deleted: false
  });

  res.render('admin/pages/account/edit', {
    pageTitle: 'Cài đặt',
    account: account
  });
}

//PATCH /admin/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      deleted: false,
      status: 'active'
    });

    if (!account) {
      req.flash('error', 'Người dùng không tồn tại!');
      return res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${req.params.id}`);
    }

    const tab = req.body.tab || req.query.tab;

    if (tab === 'account-general') {
      let verify = account.verify;
      let avt = account.avatar;

      if(req.body.avt && req.body.avt.length > 0){
        avt = req.body.avt[0];
      }

      if (req.body.username !== account.username) {
        const usernameExist = await Account.findOne({
          username: req.body.username,
          deleted: false,
          _id: { $ne: account._id }
        });
        if (usernameExist) {
          req.flash('error', 'Tên người dùng tồn tại!');
          return res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${account.id}?tab=account-general`);
        }
      }

      if (req.body.email !== account.email) {
        const emailExist = await Account.findOne({
          email: req.body.email,
          deleted: false,
          _id: { $ne: account._id }
        });
        if (emailExist) {
          req.flash('error', 'Email tồn tại!');
          return res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${account.id}?tab=account-general`);
        } else {
          verify = false;
        }
      }

      if (req.body.phone !== account.phone) {
        const phoneExist = await Account.findOne({
          phone: req.body.phone,
          deleted: false,
          _id: { $ne: account._id }
        });
        if (phoneExist) {
          req.flash('error', 'Số điện thoại tồn tại!');
          return res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${account.id}?tab=account-general`);
        }
      }

      const accountData = {
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        avatar: avt,
        address: req.body.address,
        verify: verify
      };

      await Account.updateOne({ _id: account.id }, accountData);
      req.flash('success', 'Cập nhật thành công!');
      return res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${account.id}?tab=account-general`);
    }

    if (tab === 'account-change-password') {
      const { password, newPassword, confirmPassword } = req.body;

      if (md5(password) !== account.password) {
        req.flash('error', 'Mật khẩu hiện tại không đúng!');
        return res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${account.id}?tab=account-change-password`);
      }
      if (newPassword !== confirmPassword) {
        req.flash('error', 'Mật khẩu không khớp!');
        return res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${account.id}?tab=account-change-password`);
      }

      await Account.updateOne({ _id: account.id }, { password: md5(newPassword) });
      req.flash('success', 'Đổi mật khẩu thành công!');
      return res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${account.id}?tab=account-change-password`);
    }

    // fallback
    res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${account.id}`);

  } catch (error) {
    console.error(error);
    req.flash('error', 'Cập nhật thất bại');
    return res.redirect(`/${systemConfig.prefixAdmin}/account/edit/${req.params.id}`);
  }
};

// POST /user/otp
export const otpPost = async(req: Request, res: Response) => {
  const id = req.params.id;
  const email = req.body.email;
  const user = await Account.findOne({
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
    const verifyUser = await Account.findOne({
      email: email,
      deleted: false,
      status: 'active'
    });

    await Account.updateOne({_id: verifyUser.id}, {verify: true});
    res.json({
      code: 200,
      success: true
    });
  }
}

//GET /admin/account/forgot-password
export const forgotPassword = (req: Request, res: Response) => {
  res.render('admin/pages/account/forgot-password', {
      pageTitle: 'Lấy lại mật khẩu'
  })
}

//POST account/forgot-password
export const forgotPasswordPost = async(req: Request, res: Response) => {
  const email = req.body.email;
  const user = await Account.findOne({
    email: email,
    deleted: false,
    status: 'active'
  });

  if(!user){
    req.flash('error', 'Email không tồn tại!');
    res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
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

  res.redirect(`/${systemConfig.prefixAdmin}/account/forgot-password/otp?email=${email}`);
}

//GET /account/otp
export const otpPassword = (req: Request, res: Response) => {
  const email = req.query.email;

  res.render('admin/pages/account/otp-password', {
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
      res.redirect(`/${systemConfig.prefixAdmin}/account/forgot-password/otp`);
      return;
  }

  const user = await Account.findOne({
      email: email
  });
  res.cookie("token", user.token);

  res.redirect(`/${systemConfig.prefixAdmin}/account/forgot-password/reset`);
}

//GET /account/forgot-password/reset
export const resetPassword = (req: Request, res: Response) => {
  res.render('admin/pages/account/reset-password', {
      pageTitle: 'Nhập lại mật khẩu',
  });
}

//[POST]/user/forgot-password/reset
export const resetPasswordPost = async(req: Request, res: Response) => {
  const token = req.cookies.token;
  const password = req.body.password;

  await Account.updateOne({
      token: token
  }, {
      password: md5(password)
  });

  res.redirect(`/${systemConfig.prefixAdmin}/dashboard/`);
}
