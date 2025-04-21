import { Request, Response } from 'express';
import News from '../../models/news.model';

// GET /dashboard/index
export const index = async (req: Request, res: Response) => {
  const newsList = await News.find({
    status: 'active',
    deleted: false
  }).lean();

  const activeNews = newsList[0]; // bài viết đầu tiên

  res.render('client/pages/dashboard/index', {
    pageTitle: 'Dashboard',
    newsList,
    activeNews
  });
};


export const news = async (req: Request, res: Response) => {
  const slug = req.params.slugNews;

  const newsList = await News.find({
    status: 'active',
    deleted: false
  }).lean();

  const activeNews = newsList.find(n => n.slug === slug); // tìm bài theo slug

  res.render('client/pages/dashboard/index', {
    pageTitle: 'Dashboard',
    newsList,
    activeNews
  });
};


