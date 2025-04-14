import { Request, Response } from 'express';
import Sample from '../../models/sample.model';

export const index = async(req: Request, res: Response) => {
  const samples = await Sample.find({
    status: 'active',
    deleted: false
  });

  res.render('client/pages/dashboard/index', {
    pageTitle: 'Trang tổng quan',
    samples: samples
  });
}