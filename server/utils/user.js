const Parse = require('parse/node');

module.exports.checkDuplication = async (values, editingItem) => {
  const { username, email, phone } = values;
  const dupQueries = [];
  let errMsg = '';
  if (username) {
    const duplicateUsernameQuery = new Parse.Query(Parse.User).equalTo('username', username);
    dupQueries.push(duplicateUsernameQuery);
  }
  if (email) {
    const duplicateEmailQuery = new Parse.Query(Parse.User).equalTo('email', email);
    dupQueries.push(duplicateEmailQuery);
  }
  if (phone) {
    const duplicatePhoneQuery = new Parse.Query(Parse.User).equalTo('phone', phone);
    dupQueries.push(duplicatePhoneQuery);
  }
  if (dupQueries.length === 0) {
    return errMsg;
  }
  const query = Parse.Query.or(...dupQueries);
  if (editingItem instanceof Parse.Object) {
    query.notEqualTo('objectId', editingItem.id);
  }
  const existedUser = await query.first({ useMasterKey: true });
  switch (true) {
    case !existedUser:
      break;
    case existedUser.get('username') === username:
      errMsg = '该用户名已被注册';
      break;
    case existedUser.get('email') === email:
      errMsg = '该邮箱已被注册';
      break;
    case existedUser.get('phone') === phone:
      errMsg = '该手机号已被注册';
      break;
    default:
  }
  return errMsg;
};
