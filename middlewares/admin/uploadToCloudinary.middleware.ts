import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../../helper/uploadToCloundinary';

export const uploadFields = async(req: Request, res: Response, next: NextFunction) => {
  for(const key in req['files']){
    req.body[key] = [];

    const array = req['files'][key];
    for(const item of array){
      try{
        const result = await uploadToCloudinary(item.buffer);
        req.body[key].push(result);
      } catch(error){
        console.log(error);
      }
    }
  }
  next();
}
