import Parse from 'parse';

export const getAllRoles = async () => {
  const query = new Parse.Query(Parse.Role);
  query.equalTo('status', true);
  const data = await query.find();
  const roles = data.map(item => item.toJSON());
  return roles;
};

export const test = async () => {};
