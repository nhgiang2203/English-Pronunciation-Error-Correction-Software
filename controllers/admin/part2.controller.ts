import { Request, Response } from 'express';
import Part2 from '../../models/part2.model';
import { systemConfig } from '../../config/system';

// GET /admin/part2/index
export const index = async(req: Request, res: Response) => {
  const topics = await Part2.find({
    deleted: false
  });

  res.render('admin/pages/part2/index', {
    pageTitle: 'Part 2',
    topics: topics
  });
}

//GET /admin/part2/create
export const create = (req: Request, res: Response) => {
  res.render('admin/pages/part2/create', {
    pageTitle: 'Thêm Part 2'
  });
}

//POST /admin/part2/create
export const createPost = async(req: Request, res: Response) => {
  try{
    const part2Data = {
      title: req.body.title,
      content: req.body.content,
      status: req.body.status
    }

    const part2New = new Part2(part2Data);
    await part2New.save();

    req.flash('success', 'Thêm thành công!');
  }catch(error){
    req.flash('error', 'Thêm thất bại!');
  }
  res.redirect(`/${systemConfig.prefixAdmin}/part2/create`);
}

//GET /admin/part2/edit
export const edit = async(req: Request, res: Response) => {
  const slug = req.params.slugTopic;
  try{
    if(!slug){
      req.flash('error', 'Chủ đề không tồn tại!');
      res.redirect(`/${systemConfig.prefixAdmin}/part2/index`);
      return;
    }

    const topic = await Part2.findOne({
      slug: slug,
      deleted: false
    });

    if(!topic){
      req.flash('error', 'Chủ đề không tồn tại!');
      res.redirect(`/${systemConfig.prefixAdmin}/part2/index`);
      return;
    }

    res.render('admin/pages/part2/edit', {
      pageTitle: topic.title,
      topic: topic
    });

  }catch(error){
    req.flash('error', 'Sửa thất bại!');
    res.redirect(`/${systemConfig.prefixAdmin}/part2/index`);
    return;
  }
}

//PATCH /admin/part2/edit/:slugTopic
export const editPatch = async(req: Request, res: Response) => {
  const slug = req.params.slugTopic;
  try{
    if(!slug){
      req.flash('error', 'Chủ đề không tồn tại!');
      res.redirect(`/${systemConfig.prefixAdmin}/part2/index`);
      return;
    }

    const topic = await Part2.findOne({
      slug: slug,
      deleted: false
    });

    if(!topic){
      req.flash('error', 'Chủ đề không tồn tại!');
      res.redirect(`/${systemConfig.prefixAdmin}/part2/index`);
      return;
    }

    const dataTopic = {
      title: req.body.title,
      content: req.body.content,
      status: req.body.status
    }

    await Part2.updateOne({_id: topic.id}, dataTopic);
    req.flash('success', 'Cập nhật thành công!');
    res.redirect(`/${systemConfig.prefixAdmin}/part2/edit/${slug}`);
  }catch(error){
    req.flash('error', 'Cập nhật thất bại!');
    res.redirect(`/${systemConfig.prefixAdmin}/part2/edit/${slug}`);
    return;
  }
}

//GET /admin/part2/detail/:slugTopic
export const detail = async(req: Request, res: Response) => {
  const slug = req.params.slugTopic;
  if(!slug){
    req.flash('error', 'Slug không tồn tại!');
    res.redirect(`/${systemConfig.prefixAdmin}/part2/index`);
    return;
  }

  const topic = await Part2.findOne({
    slug: slug,
    status: 'active',
    deleted: false
  });

  if(!topic){
    req.flash('error', 'Chủ đề không tồn tại!');
    res.redirect(`/${systemConfig.prefixAdmin}/part2/index`);
    return;
  }

  res.render('admin/pages/part2/detail', {
    pageTitle: topic.title,
    topic: topic
  });
}

// DELETE /admin/part2/delete/:id
export const deleteTopic = async(req: Request, res: Response) => {
  const id = req.params.id;
  await Part2.deleteOne({_id: id});
  res.redirect(`/${systemConfig.prefixAdmin}/part2/index`);
}