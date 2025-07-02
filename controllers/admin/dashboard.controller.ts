import { Request, Response } from 'express';
import { systemConfig } from '../../config/system';
import News from '../../models/news.model';
import Sample from '../../models/sample.model';
import Practice from '../../models/practice.model';
import Part2 from '../../models/part2.model';
import User from '../../models/user.model';
import Account from '../../models/account.model';
import moment from 'moment';


export const index = async(req: Request, res: Response) => {
  const news = await News.find({
    deleted: false
  }).countDocuments();

  const samples = await Sample.find({
    deleted: false
  }).countDocuments();

  const practices = await Practice.find({
    deleted: false
  }).countDocuments();

  const part2s = await Part2.find({
    deleted: false
  }).countDocuments();

  const users = await User.find({
    deleted: false
  }).countDocuments();

  const accounts = await Account.find({
    deleted: false
  }).select('username avatar');


  res.render(`${systemConfig.prefixAdmin}/pages/dashboard/index`, {
    pageTitle: 'Trang tổng quan',
    news, samples, practices, part2s, users, accounts
  });
};

export const userRegisterPerMonth = async (req: Request, res: Response) => {
  try {
    const view = req.query.view || 'month'; 
    const currentYear = new Date().getFullYear();
    const year = parseInt(req.query.year as string) || currentYear;

    if (view === 'month') {
      // Thống kê theo tháng trong 1 năm
      const registrations = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31T23:59:59.999Z`)
            }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]);

      const monthlyCounts = Array(12).fill(0);
      registrations.forEach(item => {
        monthlyCounts[item._id - 1] = item.count;
      });


      return res.json({ year, monthlyCounts });

    } else if (view === 'year') {
      // Thống kê theo năm (ví dụ từ 2020 -> hiện tại)
      const startYear = 2023;
      const endYear = currentYear;

      const registrations = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${startYear}-01-01`),
              $lte: new Date(`${endYear}-12-31T23:59:59.999Z`)
            }
          }
        },
        {
          $group: {
            _id: { $year: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]);

      const labels = [];
      const yearCounts = [];

      for (let y = startYear; y <= endYear; y++) {
        labels.push(`Năm ${y}`);
        const found = registrations.find(item => item._id === y);
        yearCounts.push(found ? found.count : 0);
      }
      return res.json({ labels, yearCounts });
    }

    res.status(400).json({ error: "Invalid view parameter" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
}
