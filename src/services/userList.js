import Parse from 'parse';

export const queryList = async (params = {}) => {
  return Parse.Cloud.run('fetchUserList', params);
};

export const createUser = async () => {};
