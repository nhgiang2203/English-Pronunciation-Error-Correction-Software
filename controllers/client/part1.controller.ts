import { Request, Response } from 'express';
import Sample from '../../models/sample.model';
import Practice from '../../models/practice.model';

// part1/index
export const index = async(req: Request, res: Response) => {
  const samples = await Sample.find({
    status: 'active',
    deleted: false
  });

  const practices = await Practice.find({
    status: 'active',
    deleted: false
  });

  res.render('client/pages/part1/index', {
    pageTitle: 'Part 1',
    samples: samples,
    practices: practices
  });
}

// part1/sample/:slugSample
export const indexSample = async(req: Request, res: Response) => {
  const sample = await Sample.findOne({
    slug: req.params.slugSample,
    deleted: false
  });

  res.render('client/pages/part1/sample/index', {
    pageTitle: sample.title,
    sample: sample
  });
};

// part1/practice/:slugPractice
export const indexPractice = async(req: Request, res: Response) => {
  const practice = await Practice.findOne({
    slug: req.params.slugPractice,
    deleted: false
  });

  res.render('client/pages/part1/practice/index', {
    pageTitle: practice.title,
    practice: practice
  });
}