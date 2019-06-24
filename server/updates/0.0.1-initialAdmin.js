const Parse = require('parse/node');

const admin = {
  username: 'admin',
  password: '123456',
  nickname: '管理员',
  email: 'admin@admin.com',
  deleted: false,
};

module.exports = done => {
  const user = new Parse.User();
  user
    .signUp(admin)
    .then(() => done())
    .catch(err => done(err));
};
