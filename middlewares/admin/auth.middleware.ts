import { Request, Response, NextFunction } from 'express';
import Account from '../../models/account.model';
import Role from '../../models/role.model';
import { systemConfig } from '../../config/system';

export const requireAuth = async(req: Request, res: Response, next: NextFunction) => {
  if(req.cookies.token){
      const user = await Account.findOne({
          token: req.cookies.token,
          deleted: false,
          status: "active"
      }).select("-password");
      if(user){
        const role = await Role.findOne({_id: user.role_id}).select("title permissions");
        console.log(role);
        res.locals.user = user;
        res.locals.role = role;

      }
  }

  next();
}

export const requireLogin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies.token) {
    const redirectUrl = `/${systemConfig.prefixAdmin}/account/login`;
    return res.redirect(redirectUrl);
  }
  next();
}
