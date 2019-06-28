const Parse = require('parse/node');

module.exports = done => {
  const roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true);
  roleACL.setPublicWriteAccess(true);
  const role = new Parse.Role('admin', roleACL);
  role.set('status', true);
  role.set('displayName', '管理员');
  const queryUser = new Parse.Query(Parse.User);
  queryUser.equalTo('username', 'admin');

  return queryUser
    .first()
    .then(user =>
      role
        .relation('users')
        .add(user)
        .save()
    )
    .then(() => done());
};
