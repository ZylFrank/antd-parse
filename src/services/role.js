import Parse from 'parse';
import { ParseQuery } from '@/utils/db';

export const getRoleList = async () => {
  const query = new ParseQuery(Parse.Role);
  query.equalTo('status', true);
  return query.pagination();
};

export const create = async (params = {}) => {
  const { name, displayName, status } = params;
  const roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true);
  roleACL.setPublicWriteAccess(true);
  const role = new Parse.Role(name, roleACL);
  role.set('displayName', displayName);
  role.set('status', status);
  return role.save();
};

export const update = async (params = {}) => {
  const { values, editRoleInfo } = params;
  const keys = Object.keys(values);
  keys.forEach(k => editRoleInfo.set(k, values[k]));
  return editRoleInfo.save();
};

export const remove = async (params = {}) => {
  const { id } = params;
  const query = new Parse.Query(Parse.Role);
  query.equalTo('objectId', id);
  const role = await query.first();
  return role.destroy();
};
