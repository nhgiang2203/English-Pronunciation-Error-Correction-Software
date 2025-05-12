import { Request, Response } from 'express';
import { systemConfig } from '../../config/system';
import News from '../../models/news.model';


// GET /news/index
export const newsIndex = async(req: Request, res: Response) => {
  const news = await News.find({
    deleted: false
  });


  res.render(`${systemConfig.prefixAdmin}/pages/news/index`, {
    pageTitle: 'Bài báo',
    news: news
  });
}

// GET /news/create
export const newsCreate = (req: Request, res: Response) => {
  res.render(`${systemConfig.prefixAdmin}/pages/news/create`, {
    pageTitle: 'Thêm bài báo'
  });
}

// POST /news/create
export const newsCreatePost = async(req: Request, res: Response) => {
  let img = '';
  if(req.body.img){
    img = req.body.img[0];
  }
  const dataNews = {
    title: req.body.title,
    img: img,
    content: req.body.content,
    status: req.body.status
  }

  const news = new News(dataNews);
  await news.save();

  res.redirect(`/${systemConfig.prefixAdmin}/news/create`);

}

// GET /admin/news/detail
export const detail = async(req: Request, res: Response) => {
  const news = await News.findOne({
    slug: req.params.slugNews,
    deleted: false
  });
  if (!news) {
    req.flash('error', 'Bài báo không tồn tại!');
    return res.redirect(`/${systemConfig.prefixAdmin}/news/index`);
  }
  res.render('admin/pages/news/detail', {
    pageTitle: news.title,
    news: news
  });
}

// GET /admin/news/edit
export const edit = async(req: Request, res: Response) => {
  const news = await News.findOne({
    slug: req.params.slugNews,
    deleted: false
  });

  if (!news) {
    req.flash('error', 'Bài báo không tồn tại!');
    return res.redirect(`/${systemConfig.prefixAdmin}/news/index`);
  }

  res.render('admin/pages/news/edit', {
    pageTitle: news.title,
    news: news
  });
};


// PATCH /admin/news/edit/:slugNews
export const editPatch = async(req: Request, res: Response) => {
  console.log(req.params.slugNews);
  try{
    const slug = req.params.slugNews;
    const news = await News.findOne({
      slug: slug,
      deleted: false
    });
    
    let img = news.img;
    if (req.body.img && req.body.img.length > 0) {
      img = req.body.img[0]; 
    }

    const newsData = {
      title: req.body.title,
      img: img,
      content: req.body.content,
      status: req.body.status
    }

    await News.updateOne({_id: news.id}, newsData);
    req.flash('success', 'Cập nhật thành công!');
  } catch(error){
    req.flash('error', 'Cập nhật thất bại!');
  }
  res.redirect(`/${systemConfig.prefixAdmin}/news/edit/${req.params.slugNews}`);
}

// DELETE /admin/news/delete/:id
export const deleteNew = async(req: Request, res: Response) => {
  const id = req.params.id;
  await News.deleteOne({_id: id});
  res.redirect(`/${systemConfig.prefixAdmin}/news/index`);
}