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

export const uploadAny = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = Array.isArray(req.files) 
      ? req.files 
      : (req.files ? Object.values(req.files).flat() : []);

    for (const file of files) {
      try {
        const result = await uploadToCloudinary(file.buffer);

        // fieldname is like: "questions[0][audio]"
        const field = file.fieldname;

        // Store the Cloudinary URL directly in req.body
        req.body[field] = result;

        console.log(`Uploaded "${field}" to Cloudinary: ${result}`);
      } catch (error) {
        console.error(`Cloudinary upload failed for "${file.fieldname}":`, error);
      }
    }

    next();
  } catch (err) {
    console.error('Unexpected error in uploadAny middleware:', err);
    next(err);
  }
};