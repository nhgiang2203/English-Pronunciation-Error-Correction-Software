import { Request, Response } from 'express';
import Sample from '../../models/sample.model';

// part1/sample/:slugSample
export const index = async(req: Request, res: Response) => {
  const sample = await Sample.findOne({
    slug: req.params.slugSample,
    deleted: false
  });

  console.log(sample.questions);

  res.render('client/pages/part1/sample/index', {
    pageTitle: sample.title,
    sample: sample
  });
  
}