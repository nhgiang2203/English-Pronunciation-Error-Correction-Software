import { Request, Response, NextFunction } from 'express';
import User from '../../models/user.model';

export const requireAuth = async(req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.tokenUser){
        const user = await User.findOne({
            tokenUser: req.cookies.tokenUser,
            deleted: false,
            status: "active"
        }).select("-password");
        if(user){
            res.locals.user = user;
        }
    }

    next();
}

export const requireLogin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.tokenUser) {
      const redirectUrl = `/user/login?redirect=${encodeURIComponent(req.originalUrl)}`;
      return res.redirect(redirectUrl);
    }
    next();
  }
  