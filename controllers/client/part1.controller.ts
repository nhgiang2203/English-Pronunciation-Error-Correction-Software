import { Request, Response } from 'express';
import Sample from '../../models/sample.model';
import Practice from '../../models/practice.model';
import { pagination } from '../../helper/pagination';

// part1/index
export const index = async (req: Request, res: Response) => {
  const findCondition = {
    deleted: false,
    status: 'active',
  };

  // Lấy tab đang được chọn (mặc định là "samples")
  const activeTab = req.query.tab === 'practices' ? 'practices' : 'samples';

  // Lấy page tương ứng với từng tab
  const samplePage = parseInt(req.query.samplePage as string) || 1;
  const practicePage = parseInt(req.query.practicePage as string) || 1;

  // Đếm tổng số
  const countSamples = await Sample.countDocuments(findCondition);
  const countPractices = await Practice.countDocuments(findCondition);

  // Tạo object phân trang
  const objectPaginationSample = pagination(
    {
      currentPage: samplePage,
      limitedItems: 12,
    },
    {}, // không lấy từ req.query vì đã truyền page rõ ràng
    countSamples
  );

  const objectPaginationPractice = pagination(
    {
      currentPage: practicePage,
      limitedItems: 12,
    },
    {},
    countPractices
  );

  // Lấy dữ liệu mẫu
  const samples = await Sample.find(findCondition)
    .sort({ createdAt: -1 })
    .limit(objectPaginationSample.limitedItems)
    .skip(objectPaginationSample.skip);

  // Lấy dữ liệu luyện tập
  const practices = await Practice.find(findCondition)
    .sort({ createdAt: -1 })
    .limit(objectPaginationPractice.limitedItems)
    .skip(objectPaginationPractice.skip);

  // Render view
  res.render('client/pages/part1/index', {
    pageTitle: 'Part 1',
    samples,
    practices,
    pagination: {
      sample: objectPaginationSample,
      practice: objectPaginationPractice,
    },
    activeTab, // truyền tab hiện tại để pug hiển thị đúng
  });
};

// part1/sample/:slugSample
export const indexSample = async(req: Request, res: Response) => {
  const sample = await Sample.findOne({
    slug: req.params.slugSample,
    deleted: false
  });

  res.render('client/pages/part1/sample/index', {
    pageTitle: sample.title,
    sample: sample
  });
};

// part1/practice/:slugPractice
export const indexPractice = async(req: Request, res: Response) => {
  const practice = await Practice.findOne({
    slug: req.params.slugPractice,
    deleted: false
  });

  res.render('client/pages/part1/practice/index', {
    pageTitle: practice.title,
    practice: practice
  });
}