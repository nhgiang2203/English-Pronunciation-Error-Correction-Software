import { Request, Response } from 'express';
import Role from '../../models/role.model';
import { systemConfig } from '../../config/system';
import { search } from '../../helper/search';
import { pagination } from '../../helper/pagination';
import { filterStatus } from '../../helper/filterStatus';

//GET /admin/role/index
export const index = async(req: Request, res: Response) => {
  let find = {
    deleted: false
  };
  //Filter status
  const filterStatusRole = filterStatus(req.query);
  if (req.query.status)
    find['status'] = req.query.status;
  
  console.log('Find condition:', find);


  //Search 
  const searchRole = search(req.query);
  if (searchRole['regex'])
      find['title'] = searchRole['regex'];
  
  //Pagination
  const countRoles = await Role.countDocuments(find);
  let objectPaginationRoles = pagination(
      {
      currentPage: 1,
      limitedItems: 4
      },
      req.query,
      countRoles
  )

  //Sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue){
      sort[req.query.sortKey] = req.query.sortValue;
  } else {
      sort['createdAt'] = "desc";
  }

  const records = await Role.find(find)
  .limit(objectPaginationRoles.limitedItems)
  .skip(objectPaginationRoles.skip)
  .sort(sort);

  res.render('admin/pages/role/index', {
    pageTitle: 'Role',
    records: records,
    pagination: objectPaginationRoles,
    keyword: searchRole['keyword'],
    filterStatus: filterStatusRole
  });
}

//[GET] admin/role/create
export const create = async(req: Request, res: Response) => {
  res.render('admin/pages/role/create', {
      pageTitle: 'Tạo nhóm quyền'
  });
}

//[POST] admin/roles/create
export const createPost = async(req: Request, res: Response) => {
  const record = new Role(req.body);
  record.save();
  res.redirect(`/${systemConfig.prefixAdmin}/role`);
}

//[GET] admin/roles/detail
export const detail = async (req: Request, res: Response) => {
  const id = req.params.id;
  const record = await Role.findOne({ _id: id, deleted: false });

  if (!record) {
    req.flash('error', 'Không tìm thấy nhóm quyền!');
    return res.redirect(`/${systemConfig.prefixAdmin}/role`);
  }

  res.render('admin/pages/role/detail', {
    pageTitle: 'Chi tiết nhóm quyền',
    record: record
  });
};

//[GET] admin/roles/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const data = await Role.findOne({ _id: req.params.id, deleted: false });

    if (!data) {
      req.flash('error', 'Không tìm thấy nhóm quyền!');
      return res.redirect(`/${systemConfig.prefixAdmin}/role`);
    }

    res.render('admin/pages/role/edit', {
      pageTitle: 'Chỉnh sửa nhóm quyền',
      data: data
    });
  } catch (error) {
    req.flash('error', 'Lỗi! Không thể truy xuất dữ liệu!');
    res.redirect(`/${systemConfig.prefixAdmin}/role`);
  }
};

//[PATCH] admin/roles/edit/:id
export const editPatch = async(req: Request, res: Response) => {
  try {
      await Role.updateOne({_id: req.params.id}, req.body);
      req.flash('success', 'Cập nhật thành công !');
  } catch(error) {
      req.flash('error', 'Lỗi! Cập nhật thất bại!');
  }
  
  res.redirect(`/${systemConfig.prefixAdmin}/role/edit/:id`);
}

//[DELETE] admin/roles/delete/:id
export const deleteRole = async (req: Request, res: Response) => {
  const id = req.params.id;
  const role = await Role.findById(id);

  if (!role) {
    req.flash('error', 'Không tìm thấy nhóm quyền!');
    return res.redirect(`/${systemConfig.prefixAdmin}/role`);
  }

  if (role.title === 'Super admin') {
    req.flash('error', 'Không thể xoá nhóm quyền Super Admin!');
    return res.redirect(`/${systemConfig.prefixAdmin}/role`);
  }

  await Role.deleteOne({ _id: id });
  req.flash('success', 'Xoá thành công!');
  res.redirect(`/${systemConfig.prefixAdmin}/role`);
};

//[GET] admin/roles/permissions
export const permissions = async(req: Request, res: Response) => {
  const find = {
      deleted: false,
      title: { $ne: "Super admin" } 
  }

  const records = await Role.find(find);
  res.render('admin/pages/role/permissions', {
      pageTitle: 'Trang phân quyền',
      records: records
  })
}

//[PATCH] admin/roles/permissions
export const permissionsPatch = async(req: Request, res: Response) => {
  const permissions = JSON.parse(req.body.permissions);

  for (const item of permissions) {
      await Role.updateOne({_id: item.id}, {permissions: item.permissions});
  }

  req.flash('success', 'Cập nhật thành công');
  res.redirect(`/${systemConfig.prefixAdmin}/role/permissions`);
}