import { Request, Response, Express } from 'express';
import Sample from '../../models/sample.model';
import Practice from '../../models/practice.model';
import { systemConfig } from '../../config/system';
import { search } from '../../helper/search';
import { pagination } from '../../helper/pagination';
import { filterStatus } from '../../helper/filterStatus';
import qs from 'qs';

// Trang chủ Sample
export const indexSample = async(req: Request, res: Response) => {
  let find = {
    deleted: false
  };
  //Filter status
  const filterStatusSample = filterStatus(req.query);
  if (req.query.status)
    find['status'] = req.query.status;
  
  console.log('Find condition:', find);


  //Search 
  const searchSample = search(req.query);
  if (searchSample['regex'])
      find['title'] = searchSample['regex'];
  
  //Pagination
  const countSamples = await Sample.countDocuments(find);
  let objectPaginationSample = pagination(
      {
      currentPage: 1,
      limitedItems: 4
      },
      req.query,
      countSamples
  )

  //Sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue){
      sort[req.query.sortKey] = req.query.sortValue;
  } else {
      sort['createdAt'] = "desc";
  }

  const samples = await Sample.find(find)
  .limit(objectPaginationSample.limitedItems)
  .skip(objectPaginationSample.skip)
  .sort(sort);


  res.render('admin/pages/part1/sample/index', {
    pageTitle: 'Bài mẫu',
    samples: samples,
    pagination: objectPaginationSample,
    keyword: searchSample['keyword'],
    filterStatus: filterStatusSample
  });
}

// GET admin/part1/sample/:slugSample
export const detailSample = async(req: Request, res: Response) => {
  const sample = await Sample.findOne({
    slug: req.params.slugSample,
    deleted: false
  });

  res.render('admin/pages/part1/sample/detail', {
    pageTitle: sample.title,
    sample: sample
  });
}

// GET admin/part1/sample/edit/:slugSample
export const editSample = async(req: Request, res: Response) => {
  const sample = await Sample.findOne({
    slug: req.params.slugSample,
    deleted: false
  });

  if(!sample){
    req.flash('error', 'Bài mẫu không tồn tại!');
    res.redirect(`/${systemConfig.prefixAdmin}/part1/sample/index`);
  }
  res.render('admin/pages/part1/sample/edit', {
    pageTitle: sample.title,
    sample: sample
  });
}

// PATCH admin/part1/sample/edit/:slugSample
export const editSamplePatch = async (req: Request, res: Response) => {
  const slug = req.params.slugSample;

  try {
    const sample = await Sample.findOne({ slug, deleted: false });
    if (!sample) {
      req.flash('error', 'Bài mẫu không tồn tại!');
      return res.redirect(`/${systemConfig.prefixAdmin}/part1/sample/edit/${slug}`);
    }

    const questions = req.body.questions || {};
    const answers = req.body.answers || {};

    const updatedQuestions = [];
    const updatedAnswers = [];

    const indices = Object.keys(questions);

    indices.forEach(index => {
      const qText = questions[index]?.text || '';
      console.log(qText);
      const qAudio = req.body[`questions[${index}][audioFile]`] || questions[index]?.audio || sample.questions?.[index]?.[1] || '';
      console.log(qAudio);
      updatedQuestions.push([qText, qAudio]);

      const aText = answers[index]?.text || '';
      const aAudio = req.body[`answers[${index}][audioFile]`] || answers[index]?.audio || sample.answers?.[index]?.[1] || '';
      updatedAnswers.push([aText, aAudio]);
    });


    const sampleData = {
      title: req.body.title,
      status: req.body.status,
      questions: updatedQuestions,
      answers: updatedAnswers
    };


    await Sample.updateOne({ _id: sample._id }, sampleData);
    req.flash('success', 'Cập nhật thành công!');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Cập nhật thất bại!');
  }

  res.redirect(`/${systemConfig.prefixAdmin}/part1/sample/edit/${slug}`);
};



//GET admin/part1/sample/create
export const createSample = (req: Request, res: Response) => {
  res.render('admin/pages/part1/sample/create', {
    pageTitle: 'Thêm bài mẫu'
  });
}

//PATCH admin/part1/sample/create
export const createSamplePost = async(req: Request, res: Response) => {
  try{
    const questions = req.body.questions || {};
    const answers = req.body.answers || {};

    console.log(questions);


    const ques = [];
    const ans = [];

    const indices = Object.keys(questions);
    indices.forEach(index => {
      const qText = questions[index]?.text || '';
      console.log(qText);
      const qAudio = req.body[`questions[${index}][audioFile]`] || questions[index]?.audio || '';
      console.log(qAudio);
      ques.push([qText, qAudio]);

      const aText = answers[index]?.text || '';
      const aAudio = req.body[`answers[${index}][audioFile]`] || answers[index]?.audio || '';
      ans.push([aText, aAudio]);
    });


    const sampleData = {
      title: req.body.title,
      status: req.body.status,
      questions: ques,
      answers: ans
    }

    const newSample = new Sample(sampleData);
    await newSample.save();

    req.flash('success', 'Thêm thành công!');
  } catch(error){
    req.flash('error', 'Thêm thất bại!');
  }
  
  res.redirect(`/${systemConfig.prefixAdmin}/part1/sample/create`);
}

// DELETE admin/part1/sample/delete/:id
export const deleteSample = async(req: Request, res: Response) => {
  const id = req.params.id;
  await Sample.deleteOne({_id: id});
  res.redirect(`/${systemConfig.prefixAdmin}/part1/sample/index`);
}


// Trang chủ Practice
export const indexPractice = async(req: Request, res: Response) => {
  let find = {
    deleted: false
  };
  //Filter status
  const filterStatusPractice = filterStatus(req.query);
  if (req.query.status)
    find['status'] = req.query.status;
  
  console.log('Find condition:', find);


  //Search 
  const searchPractice = search(req.query);
  if (searchPractice['regex'])
      find['title'] = searchPractice['regex'];
  
  //Pagination
  const countPractices = await Practice.countDocuments(find);
  let objectPaginationPractice = pagination(
      {
      currentPage: 1,
      limitedItems: 4
      },
      req.query,
      countPractices
  )

  //Sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue){
      sort[req.query.sortKey] = req.query.sortValue;
  } else {
      sort['createdAt'] = "desc";
  }

  const practices = await Practice.find(find)
  .limit(objectPaginationPractice.limitedItems)
  .skip(objectPaginationPractice.skip)
  .sort(sort);

  res.render('admin/pages/part1/practice/index', {
    pageTitle: 'Bài luyện tập',
    practices: practices,
    pagination: objectPaginationPractice,
    keyword: searchPractice['keyword'],
    filterStatus: filterStatusPractice
  });
}

// GET /admin/part1/practice/detail
export const detailPractice= async(req: Request, res: Response) => {
  const practice = await Practice.findOne({
    slug: req.params.slugPractice,
    deleted: false
  }).sort({ createdAt: -1 });

  res.render('admin/pages/part1/practice/detail', {
    pageTitle: practice.title,
    practice: practice
  });
}

// GET /admin/part1/practice/edit/:slugPractice
export const editPractice = async(req: Request, res: Response) => {
  const practice = await Practice.findOne({
    slug: req.params.slugPractice,
    deleted: false
  });

  if(!practice){
    req.flash('error', 'Bài luyện tập không tồn tại!');
    res.redirect(`/${systemConfig.prefixAdmin}/part1/practice/index`);
  }
  res.render('admin/pages/part1/practice/edit', {
    pageTitle: practice.title,
    practice: practice
  });
}

//PATCH /admin/part1/practice/edit/:slugPractice
export const editPracticePatch = async (req: Request, res: Response) => {
  const slug = req.params.slugPractice;

  try {
    const practice = await Practice.findOne({ slug, deleted: false });
    if (!practice) {
      req.flash('error', 'Bài luyện tập không tồn tại!');
      return res.redirect(`/${systemConfig.prefixAdmin}/part1/practice/edit/${slug}`);
    }

    const questions = req.body.questions || {};

    const updatedQuestions = [];

    const indices = Object.keys(questions);

    indices.forEach(index => {
      const qText = questions[index]?.text || '';
      const qAudio = req.body[`questions[${index}][audioFile]`] || questions[index]?.audio || practice.questions[index]?.audio || '';
    
      updatedQuestions.push({
        text: qText,
        audio: qAudio
      });
    });
    

    const practiceData = {
      title: req.body.title,
      status: req.body.status,
      questions: updatedQuestions
    };


    await Practice.updateOne({ _id: practice.id }, practiceData);
    req.flash('success', 'Cập nhật thành công!');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Cập nhật thất bại!');
  }

  res.redirect(`/${systemConfig.prefixAdmin}/part1/practice/edit/${slug}`);
};

// GET /admin/part1/practice/create
export const createPractice = (req: Request, res: Response) => {
  res.render('admin/pages/part1/practice/create', {
    pageTitle: 'Thêm bài luyện tập'
  });
}

//POST /admin/part1/practice/create
export const createPracticePost = async(req: Request, res: Response) => {
  try{
    const questions = req.body.questions || {};

    console.log(questions);

    const ques = [];

    const indices = Object.keys(questions);
    indices.forEach(index => {
      const qText = questions[index]?.text || '';
      const qAudio = req.body[`questions[${index}][audioFile]`] || questions[index]?.audio || '';
    
      ques.push({
        text: qText,
        audio: qAudio
      });
    });


    const practiceData = {
      title: req.body.title,
      status: req.body.status,
      questions: ques
    }

    const newPractice = new Practice(practiceData);
    await newPractice.save();

    req.flash('success', 'Thêm thành công!');
  } catch(error){
    req.flash('error', 'Thêm thất bại!');
  }
  
  res.redirect(`/${systemConfig.prefixAdmin}/part1/practice/create`);
}

// DELETE admin/part1/sample/delete/:id
export const deletePractice = async(req: Request, res: Response) => {
  const id = req.params.id;
  await Practice.deleteOne({_id: id});
  res.redirect(`/${systemConfig.prefixAdmin}/part1/practice/index`);
}