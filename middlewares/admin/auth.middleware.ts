import { Request, Response, NextFunction } from 'express';
import Account from '../../models/account.model';
import { systemConfig } from '../../config/system';

export const requireAuth = async(req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.token){
        const user = await Account.findOne({
            tokenUser: req.cookies.tokenUser,
            deleted: false,
            status: "active"
        }).select("-password");
        if(user){
            res.locals.user = user;
            next();
        } else {
          res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
        }

        
    } else {
      res.redirect(`/${systemConfig.prefixAdmin}/account/login`);
    }

    
}


  