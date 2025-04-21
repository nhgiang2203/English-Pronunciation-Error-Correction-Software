import { Request, Response } from 'express';
import { systemConfig } from '../../config/system';
import News from '../../models/news.model';


// GET /news/index
export const newsIndex = async(req: Request, res: Response) => {
  const news = await News.find({
    status: 'active',
    deleted: false
  });

  console.log(news)

  res.render(`${systemConfig.prefixAdmin}/pages/news/index`, {
    pageTitle: 'News',
    news: news
  });
}

// GET /news/create
export const newsCreate = (req: Request, res: Response) => {
  res.render(`${systemConfig.prefixAdmin}/pages/news/create`, {
    pageTitle: 'Create news'
  });
}

// POST /news/create
export const newsCreatePost = async(req: Request, res: Response) => {
  let img = '';
  if(req.body.img){
    img = req.body.img;
  }
  const dataNews = {
    title: req.body.title,
    image: img,
    content: req.body.content,
    status: req.body.status
  }

  console.log(dataNews);

  const news = new News(dataNews);
  await news.save();

  res.redirect(`/${systemConfig.prefixAdmin}/news/create`);

}