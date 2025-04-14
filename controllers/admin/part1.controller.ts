import { Request, Response } from 'express';
import Sample from '../../models/sample.model';
import Practice from '../../models/practice.model';

// Trang chủ Sample
export const indexSample = async(req: Request, res: Response) => {
  const samples = await Sample.find({
    deleted: false
  });

  res.render('admin/pages/part1/sample/index', {
    pageTitle: 'Sample',
    samples: samples
  });
}