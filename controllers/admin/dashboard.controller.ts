import { Request, Response } from 'express';
import { systemConfig } from '../../config/system';
import News from '../../models/news.model';

export const index = (req: Request, res: Response) => {
  res.render(`${systemConfig.prefixAdmin}/pages/dashboard/index`, {
    pageTitle: 'Trang tổng quan'
  });
};

