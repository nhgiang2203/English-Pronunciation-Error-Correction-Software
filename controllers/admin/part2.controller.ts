import { Request, Response } from 'express';
import Part2 from '../../models/part2.model';
import { systemConfig } from '../../config/system';
import { search } from '../../helper/search';
import { pagination } from '../../helper/pagination';
import { filterStatus } from '../../helper/filterStatus';

// GET /admin/part2/index
export const index = async(req: Request, res: Response) => {
  let find = {
    deleted: false
  };
  //Filter status
  const filterStatusPart2 = filterStatus(req.query);
  if (req.query.status)
    find['status'] = req.query.status;
  
  console.log('Find condition:', find);


  //Search 
  const searchPart2 = search(req.query);
  if (searchPart2['regex'])
      find['title'] = searchPart2['regex'];
  
  //Pagination
  const countPart2s = await Part2.countDocuments(find);
  let objectPaginationPart2 = pagination(
      {
      currentPage: 1,
      limitedItems: 4
      },
      req.query,
      countPart2s
  )

  //Sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue){
      sort[req.query.sortKey] = req.query.sortValue;
  } else {
      sort['createdAt'] = "desc";
  }

  const topics = await Part2.find(find)
  .limit(objectPaginationPart2.limitedItems)
  .skip(objectPaginationPart2.skip)
  .sort(sort);

  res.render('admin/pages/part2/index', {
    pageTitle: 'Part2',
    topics: topics,
    pagination: objectPaginationPart2,
    keyword: searchPart2['keyword'],
    filterStatus: filterStatusPart2
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