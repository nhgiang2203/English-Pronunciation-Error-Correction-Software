import { Request, Response } from 'express';
import Account from '../../models/account.model';
import Role from '../../models/role.model';
import md5 from 'md5';
import { systemConfig } from '../../config/system';
import { search } from '../../helper/search';
import { pagination } from '../../helper/pagination';
import { filterStatus } from '../../helper/filterStatus';

//GET /admin/accounts
export const index = async (req: Request, res: Response) => {
  let find = {
    deleted: false
  };
  //Filter status
  const filterStatusAccount = filterStatus(req.query);
  if (req.query.status)
    find['status'] = req.query.status;
  
  console.log('Find condition:', find);


  //Search 
  const searchAccount = search(req.query);
  if (searchAccount['regex'])
      find['username'] = searchAccount['regex'];
  
  //Pagination
  const countAccounts = await Account.countDocuments(find);
  let objectPaginationAccounts = pagination(
      {
      currentPage: 1,
      limitedItems: 4
      },
      req.query,
      countAccounts
  )

  //Sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue){
      sort[req.query.sortKey] = req.query.sortValue;
  } else {
      sort['createdAt'] = "desc";
  }

  const records = await Account.find(find)
  .select("-password -token")
  .limit(objectPaginationAccounts.limitedItems)
  .skip(objectPaginationAccounts.skip)
  .sort(sort);


  for (const record of records) {
      const role = await Role.findOne({
          _id: record.role_id,
          deleted: false
      });
      record['role'] = role;
  }

  res.render('admin/pages/accounts/index', {
    pageTitle: 'Danh sách tài khoản',
    records: records,
    pagination: objectPaginationAccounts,
    keyword: searchAccount['keyword'],
    filterStatus: filterStatusAccount
  });
}

//[GET] admin/accounts/create
export const create = async (req: Request, res: Response) => {
  const roles = await Role.find({deleted: false});
  res.render('admin/pages/accounts/create', {
      pageTitle: 'Danh sách tài khoản',
      roles: roles
  });
}

//[POST] admin/accounts/create
export const createPost = async (req: Request, res: Response) => {
  const emailExist = await Account.findOne({
      email: req.body.email,
      deleted: false
  });
  if (emailExist) {
      req.flash('error', `Email ${req.body.email} đã tồn tại`);
      res.redirect('back');
  } else {
      req.body.password = md5(req.body.password);

      const accountData = {
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        role_id: req.body.role_id,
        status: req.body.status,
        password: req.body.password
      }
      
      if(req.body.avatar){
        accountData['avatar'] = req.body.avatar[0];
      }

      const account = new Account(accountData);
      await account.save();
      res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }

}

//[GET] admin/accounts/edit/:id
export const edit = async(req: Request, res: Response) => {
  const find = {
      deleted: false,
      _id: req.params.id
  }
  
  const data = await Account.findOne(find);
  const roles = await Role.find({
      deleted: false
  })

  res.render('admin/pages/accounts/edit', {
      pageTitle: 'Chỉnh sửa tài khoản',
      data: data,
      roles: roles
  })
}

//[PATCH] admin/accounts/edit/:id
export const editPatch = async(req: Request, res: Response) => {
  const emailExist = await Account.findOne({
      _id: { $ne: req.params.id }, //ne: not equal ==> tìm bản ghi khác với bản ghi này
      email: req.body.email,
      deleted: false
  })
  if (emailExist) {
      req.flash('error', `Email ${req.body.email} đã tồn tại`);
  } else {
      if (req.body.password){
          req.body.password = md5(req.body.password);
      } else {
          delete req.body.password;
      }
      if(req.body.avatar){
        req.body.avatar = req.body.avatar[0];
      }
      await Account.updateOne({_id: req.params.id}, req.body);
      req.flash("success", "Cập nhật tài khoản thành công!");
  }
  res.redirect(`/${systemConfig.prefixAdmin}/accounts/edit/${req.params.id}`);
  
}

//[DELETE] admin/roles/delete/:id
export const deleteAccounts = async(req: Request, res: Response) => {
  const id = req.params.id;
  const account = await Account.findById(id);

  if (!account) {
    req.flash('error', 'Không tìm thấy nhóm quyền!');
    return res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
  const idAdmin = await Role.findOne({
    title: 'Super admin'
  })

  if (account.role_id === idAdmin.id) {
    req.flash('error', 'Không thể xoá nhóm quyền Super Admin!');
    return res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }
  await Account.deleteOne({_id: req.params.id});
  req.flash('success', 'Xóa thành công !');
  res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
  }

//[GET] admin/accounts/detail/:id
export const detail = async(req: Request, res: Response) => {
  const find = {
      deleted: false,
      _id: req.params.id
  }
  
  const data = await Account.findOne(find);
  const role = await Role.findOne({
      _id: data.role_id,
      deleted: false
  });
  data['role'] = role.title;

  res.render('admin/pages/accounts/detail', {
      pageTitle: 'Chỉnh sửa tài khoản',
      data: data
  })
}