const Parse = require('parse/node');
const _ = require('lodash');
const Promise = require('bluebird');
const { checkDuplication } = require('../../utils/user');

Parse.Cloud.define('fetchUserList', async req => {
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
    return Parse.Error(600, '参数values有误');
  }
  const errMsg = await checkDuplication(values);
  if (errMsg) {
    return Parse.Error(600, errMsg);
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
    return Parse.Error(600, '参数id有误');
  }
  if (!_.isPlainObject(values)) {
    return Parse.Error(600, '参数values有误');
  }
  const user = await new Parse.Query(Parse.User)
    .equalTo('deleted', false)
    .get(id, { useMasterKey: true });
  if (!user) {
    return Parse.Error(601, '用户不存在');
  }

  const errMsg = await checkDuplication(values, user);
  if (errMsg) {
    return Parse.Error(600, errMsg);
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
