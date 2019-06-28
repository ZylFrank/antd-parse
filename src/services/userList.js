import Parse from 'parse';

export const queryList = async (params = {}) => {
  return Parse.Cloud.run('fetchUserList', params);
};

export const createUser = async (params = {}) => {
  return Parse.Cloud.run('createUser', params);
};

export const getUserItem = async (params = {}) => {
  return Parse.Cloud.run('fetchUser', params);
};

export const updateUser = async (params = {}) => {
  return Parse.Cloud.run('updateUser', params);
};
