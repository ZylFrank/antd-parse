const Parse = require('parse/node');
const Promise = require('bluebird');

const data = [
  {
    label: '性别',
    value: 'GENDER',
    children: [
      {
        label: '男',
        value: 'MALE',
      },
      {
        label: '女',
        value: 'FEMALE',
      },
    ],
  },
];

const addDictionaries = (e, parent = '') => {
  const lenPromise = new Parse.Query('Dictionary')
    .equalTo('parent', parent)
    .equalTo('deleted', false)
    .count();
  return lenPromise.then(len => {
    return Promise.each(e, (item, index) => {
      const { children, value, label } = item;
      return (
        new Parse.Object('Dictionary')
          .insertOne({
            label,
            value,
            parent,
            order: len + index + 1,
          })
          // eslint-disable-next-line consistent-return
          .then(() => {
            if (Array.isArray(children) && children.length > 0) {
              return addDictionaries(children, value);
            }
          })
      );
    });
  });
};

module.exports = done => {
  addDictionaries(data)
    .then(() => done())
    .catch(err => done(err));
};
