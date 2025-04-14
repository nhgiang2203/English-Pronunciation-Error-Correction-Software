import { Request, Response } from 'express';
import { systemConfig } from '../../config/system';

export const index = (req: Request, res: Response) => {
  res.render('admin/pages/dashboard/index', {
    pageTitle: 'Trang tổng quan'
  });
};