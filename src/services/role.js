import Parse from 'parse';
import { ParseQuery } from '@/utils/db';

export const getRoleList = async () => {
  const query = new ParseQuery(Parse.Role);
  query.equalTo('status', true);
  return query.pagination();
};

export const createRole = async () => {};
