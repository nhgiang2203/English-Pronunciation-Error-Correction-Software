import { Request, Response } from 'express';
import Part2 from '../../models/part2.model';


//GET /part2/index
export const index = async(req: Request, res: Response) => {
  const topics = await Part2.find({
    status: 'active',
    deleted: false
  });

  res.render('client/pages/part2/index', {
    pageTitle: 'Part 2',
    topics: topics
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
