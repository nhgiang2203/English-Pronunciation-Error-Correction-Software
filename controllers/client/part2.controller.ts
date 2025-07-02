import { Request, Response } from 'express';
import Part2 from '../../models/part2.model';
import { pagination } from '../../helper/pagination';


//GET /part2/index
export const index = async(req: Request, res: Response) => {
  let find = {
    status: 'active',
    deleted: false
  };
  //Pagination
  const countPart2s = await Part2.countDocuments(find);
  let objectPaginationPart2 = pagination(
      {
      currentPage: 1,
      limitedItems: 12
      },
      req.query,
      countPart2s
  )

  const topics = await Part2.find(find)
  .sort({ createdAt: -1 })
  .limit(objectPaginationPart2.limitedItems)
  .skip(objectPaginationPart2.skip)


  res.render('client/pages/part2/index', {
    pageTitle: 'Part 2',
    topics: topics,
    pagination: objectPaginationPart2,
  });
}

//GET /part2/detail/:slugTopic
export const detail = async(req: Request, res: Response) => {
  const slug = req.params.slugTopic;
  if(!slug){
    req.flash('error', 'Slug không tồn tại!');
    res.redirect('/part2/index');
    return;
  }

  const topic = await Part2.findOne({
    slug: slug,
    status: 'active',
    deleted: false
  });
  if(!topic){
    req.flash('error', 'Chủ đề không tồn tại!');
    res.redirect('/part2/index');
    return;
  }

  res.render('client/pages/part2/detail', {
    pageTitle: topic.title,
    topic: topic
  });
}
