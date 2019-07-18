import Parse from 'parse';
import { message } from 'antd';
import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

export async function login(params) {
  try {
    const { userName, password } = params;
    const user = await Parse.User.logIn(userName, password);
    return user;
  } catch (error) {
    message.error('请输入正确的用户名，密码');
    throw error;
  }
}

export async function logout() {
  return Parse.User.logOut();
}
