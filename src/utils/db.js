import Parse from 'parse';
import Promise from 'bluebird';
import _ from 'lodash';

export const query = (model, params = {}, constraints = []) => {
  if (!_.isString(model) || !_.isPlainObject(params) || !_.isArray(constraints)) {
    throw new Error('query 参数错误！');
  }
  const q = new Parse.Query(model);
  Object.keys(params).forEach(k => q.equalTo(k, params[k]));
  constraints.forEach(constraint => Object.keys(constraint).forEach(k => q[k](...constraint[k])));
  return q;
};

export class ParseQuery extends Parse.Query {
  constructor(...args) {
    super(...args);
    this.args = args;
  }

  pagination = (options = {}) => {
    const page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const limit = parseInt(options.limit, 10) > 0 ? parseInt(options.page, 10) : 10;
    const count = this.count();
    const list = this.skip((page - 1) * limit)
      .limit(limit)
      .find()
      .then(rets => rets);
    return Promise.props({
      list,
      pagination: Promise.props({
        current: page,
        pageSize: limit,
        total: count,
      }),
    });
  };
}

export const findOne = (model, params, isConverted = true) => {
  if (!_.isBoolean(isConverted)) {
    throw new Error('findOne 参数错误！');
  }
  return query(model, params)
    .first()
    .then(ret => {
      if (ret && isConverted) {
        return ret.toJSON();
      }
      return ret;
    });
};

export const findMany = (model, params, constraints, isConverted = true) => {
  if (!_.isBoolean(isConverted)) {
    throw new Error('findMany 参数错误');
  }
  return query(model, params, constraints)
    .find()
    .then(rets =>
      rets.map(ret => {
        if (ret && isConverted) {
          return ret.toJSON();
        }
        return ret;
      })
    );
};
