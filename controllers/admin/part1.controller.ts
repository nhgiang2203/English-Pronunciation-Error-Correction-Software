import { Request, Response, Express } from 'express';
import Sample from '../../models/sample.model';
import Practice from '../../models/practice.model';
import { systemConfig } from '../../config/system';
import qs from 'qs';

// Trang chủ Sample
export const indexSample = async(req: Request, res: Response) => {
  const samples = await Sample.find({
    deleted: false
  });

  
  res.render('admin/pages/part1/sample/index', {
    pageTitle: 'Sample',
    samples: samples
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
    req.flash('error', 'Sample not exist!');
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
      req.flash('error', 'Sample not found!');
      return res.redirect(`/${systemConfig.prefixAdmin}/part1/sample/edit/${slug}`);
    }

    const body = qs.parse(req.body); // parse để đọc questions[0][text], v.v.
    
    const updatedQuestions: [string, string | null][] = [];
    const updatedAnswers: [string, string | null][] = [];

    const total = Object.keys(body.questions || {}).length;

    for (let i = 0; i < total; i++) {
      const qText = body.questions?.[i]?.text || '';
      const aText = body.answers?.[i]?.text || '';

      const qAudioUrl = body.questions?.[i]?.audio || sample.questions[i]?.[1] || null;
      const aAudioUrl = body.answers?.[i]?.audio || sample.answers[i]?.[1] || null;

      updatedQuestions.push([qText, qAudioUrl]);
      updatedAnswers.push([aText, aAudioUrl]);
    }

    const sampleData = {
      title: req.body.title,
      questions: updatedQuestions,
      answers: updatedAnswers,
      status: body.status
    };

    await Sample.updateOne({ _id: sample._id }, sampleData);

    req.flash('success', 'Update successfully!');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Update failed!');
  }

  res.redirect(`/${systemConfig.prefixAdmin}/part1/sample/edit/${slug}`);
};

//GET admin/part1/sample/create
export const createSample = (req: Request, res: Response) => {
  res.render('admin/pages/part1/sample/create', {
    pageTitle: 'Create'
  });
}

//PATCH admin/part1/sample/create
export const createSamplePost = async(req: Request, res: Response) => {
  try{
    const questions = req.body.questions || {};
    const answers = req.body.answers || {};


    const ques = [];
    const ans = [];

    const indices = Object.keys(questions);
    indices.forEach(index => {
      const qText = questions[index]?.text || '';
      const qAudio = req.body[`questions[${index}][audio]`] || '';
      ques.push([qText, qAudio]);

      const aText = answers[index]?.text || '';
      const aAudio = req.body[`answers[${index}][audio]`] || '';
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

    req.flash('success', 'Create successfully!');
  } catch(error){
    req.flash('error', 'Create failed!');
  }
  
  res.redirect(`/${systemConfig.prefixAdmin}/part1/sample/create`);
}

// DELETE admin/part1/sample/delete/:id
export const deleteSample = async(req: Request, res: Response) => {
  const id = req.params.id;
  await Sample.deleteOne({_id: id});
  res.redirect(`/${systemConfig.prefixAdmin}/part1/sample/index`);
}