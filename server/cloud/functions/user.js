const Parse = require('parse/node');
const _ = require('lodash');
const Promise = require('bluebird');
const { checkDuplication } = require('../../utils/user');

Parse.Cloud.define('fetchUserList', async req => {
  // 升级到3.0.0的错误处理
  // throw 'Something went wrong';
  // throw new Error('Something else went wrong')
  // throw new Parse.Error(610);
  // 自定义错误处理
  // throw new Parse.Error(1001, 'My Error');

  const query = new Parse.Query(Parse.User);

  const { nickname, username, email } = req.params;
  if (nickname) {
    query.contains('nickname', nickname);
  }
  if (username) {
    query.contains('username', username);
  }
  query.where({ email });

  let { current = 1, pageSize = 10 } = req.params;
  current = typeof current === 'string' ? parseInt(current, 10) : current;
  pageSize = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;

  const total = await query.count();

  const list = await query
    .skip((current - 1) * pageSize)
    .limit(pageSize)
    .descending('updatedAt')
    .find({ useMasterKey: true });

  const result = {
    list,
    pagination: {
      current,
      pageSize,
      total,
    },
  };
  return result;
});

// eslint-disable-next-line consistent-return
Parse.Cloud.define('createUser', async req => {
  const { values } = req.params;
  const { roles: selectedRoles } = values;
  delete values.roles;

  if (!_.isPlainObject(values)) {
    throw new Error('参数有误');
  }
  const errMsg = await checkDuplication(values);
  if (errMsg) {
    throw new Error(errMsg);
  }
  const user = new Parse.User();
  await user.signUp({
    ...values,
    deleted: false,
  });

  if (selectedRoles.length > 0) {
    const queryRole = new Parse.Query(Parse.Role);
    queryRole.containedIn('objectId', selectedRoles);
    const queryRoles = await queryRole.findAll();
    await Promise.mapSeries(queryRoles, async item => {
      const relation = item.relation('users');
      relation.add(user);
      await item.save();
      return item;
    });
  }
  return user;
});

// eslint-disable-next-line consistent-return
Parse.Cloud.define('updateUser', async req => {
  const { id, values, roles = [] } = req.params;
  const { roles: selectedRoles = [] } = values;
  delete values.roles;

  if (typeof id !== 'string') {
    throw new Error('参数id有误');
  }
  if (!_.isPlainObject(values)) {
    throw new Error('参数有误');
  }
  const user = await new Parse.Query(Parse.User)
    .equalTo('deleted', false)
    .get(id, { useMasterKey: true });
  if (!user) {
    throw new Error('用户不存在');
  }

  const errMsg = await checkDuplication(values, user);
  if (errMsg) {
    throw new Error(errMsg);
  }

  const addRoleItems = selectedRoles.filter(item => !roles.includes(item));
  const removeRoleItems = roles.filter(item => !selectedRoles.includes(item));

  if (addRoleItems.length > 0) {
    const queryRole = new Parse.Query(Parse.Role);
    queryRole.containedIn('objectId', addRoleItems);
    const queryRoles = await queryRole.findAll();

    await Promise.mapSeries(queryRoles, async item => {
      const relation = item.relation('users');
      relation.add(user);
      await item.save();
      return item;
    });
  }

  if (removeRoleItems.length > 0) {
    const queryRole = new Parse.Query(Parse.Role);
    queryRole.containedIn('objectId', removeRoleItems);
    const queryRoles = await queryRole.findAll();

    await Promise.mapSeries(queryRoles, async item => {
      const relation = item.relation('users');
      relation.remove(user);
      await item.save();
      return item;
    });
  }

  await user.save(values, { useMasterKey: true });
  return user;
});

Parse.Cloud.define('fetchUser', async req => {
  const { id } = req.params;
  const queryUser = new Parse.Query(Parse.User);
  const queryRole = new Parse.Query(Parse.Role);
  const user = await queryUser.equalTo('deleted', false).get(id, { useMasterKey: true });
  const roles = await queryRole.containedIn('users', [user]).find({ useMasterKey: true });
  return {
    user,
    roles,
  };
});
