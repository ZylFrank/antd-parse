import Parse from 'parse';
import { message } from 'antd';

export const queryList = async () => {
  const query = new Parse.Query('Dictionary');
  query.equalTo('deleted', false);
  return query.find();
};

export const addItem = async params => {
  const { value } = params;
  const dictionary = new Parse.Object('Dictionary');
  const query = new Parse.Query(dictionary);
  query.equalTo('value', value);
  const existed = await query.first();
  if (existed) {
    message.error('值已经被占用, 请选择新的值');
  } else {
    return dictionary.save({ ...params, deleted: false });
  }
  return null;
};

// eslint-disable-next-line consistent-return
export const updateItem = async ({ itemJson, values }) => {
  const { value } = values;
  const item = Parse.Object.fromJSON({
    ...itemJson,
    className: 'Dictionary',
  });
  if (value && value !== item.get('value')) {
    const query = new Parse.Query(item);
    query.equalTo('value', value);
    const existed = await query.first();
    if (existed) {
      message.error('值已经被占用, 请选择新的值');
    } else {
      return item.save(values);
    }
  } else {
    return item.save(values);
  }
};

export const deletedItem = async itemJson => {
  const item = Parse.Object.fromJSON({
    ...itemJson,
    className: 'Dictionary',
  });
  return item.save({ deleted: true });
};
