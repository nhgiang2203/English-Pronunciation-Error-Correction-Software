import { Request, Response } from 'express';
import Sample from '../../models/sample.model';
import Practice from '../../models/practice.model';
import Part2 from '../../models/part2.model';
import User from '../../models/user.model';
import { convertToSlug } from '../../helper/convertToSlug';

//GET /search/result
export const result = async(req: Request, res: Response) => {
  const keyword: string = `${req.query.keyword}`;
  const type: string = `${req.params.type}`;

  let newSample = [];
  let newPractice = [];
  let newPart2 = [];
  let newUser = [];

  if(keyword){
    const keywordRegex = new RegExp(keyword, 'i');
    console.log(keywordRegex);
    const unicodeSlug = convertToSlug(keyword);
    const slugRegex = new RegExp(unicodeSlug, 'i');

    const samples = await Sample.find({
      $or: [
        { title: keywordRegex },
        { slug: slugRegex }
      ]
    });
    console.log(samples);
    if(samples.length > 0){
      for(const sample of samples){
        newSample.push({
          id: sample.id,
          title: sample.title,
          slug: sample.slug
        });
      }
    }
    console.log(newSample);
    const practices = await Practice.find({
      $or: [
        { title: keywordRegex },
        { slug: slugRegex }
      ]
    });
    if(practices.length > 0){
      for(const practice of practices){
        newPractice.push({
          id: practice.id,
          title: practice.title,
          slug: practice.slug
        });
      }
    }

    const part2s = await Part2.find({
      $or: [
        { title: keywordRegex },
        { slug: slugRegex }
      ]
    });
    if(part2s.length > 0){
      for(const part2 of part2s){
        newPart2.push({
          id: part2.id,
          title: part2.title,
          slug: part2.slug
        });
      }
    }

    const users = await User.find({
      username: keywordRegex
    });
    if(users.length > 0){
      for(const user of users){
        newUser.push({
          id: user.id,
          username: user.username,
          avatar: user.avatar
        });
      }
    }

    switch(type){
      case "result":
        res.render('client/pages/search/result', {
          pageTitle: `Kết quả ${keyword}`,
          keyword: keyword,
          samples: newSample,
          practices: newPractice,
          part2s: newPart2,
          users: newUser
        });
        break;

      case "suggest":
        res.json({
          code: 200,
          samples: newSample,
          practices: newPractice,
          part2s: newPart2,
          users: newUser
        });
        break;
      default:
        res.json({
          code: 400,
          message: "Lỗi!"
        });
        break;
    }
  }

}

