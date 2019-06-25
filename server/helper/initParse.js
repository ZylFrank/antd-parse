const Parse = require('parse/node');

module.exports = () => {
  const port = process.env.SERVER_PORT || 1337;
  const serverURL = process.env.SERVER_URL || 'http://localhost';
  const parseUri = `${serverURL}:${port}/api`;

  Parse.initialize(process.env.APP_ID, '', process.env.MASTER_KEY);
  Parse.serverURL = parseUri;

  Parse.Object.prototype.insertOne = function insertOne(values = {}) {
    this.set('deleted', false);
    return this.save(values);
  };

  Parse.Object.prototype.deleteOne = function deleteOne() {
    this.set('deleted', true);
    return this.save();
  };

  Parse.Object.prototype.setFields = function setFields(values = {}) {
    this.set('deleted', false);
    this.set(values);
    return this;
  };

  Parse.Object.prototype.addRelation = function addRelation(key, objects) {
    const relation = this.relation(key);
    relation.add(objects);
    return this;
  };

  Parse.Object.prototype.removeRelation = function removeRelation(key, objects) {
    const relation = this.relation(key);
    relation.remove(objects);
    return this;
  };

  Parse.Object.prototype.getRelationQuery = function getRelationQuery(key) {
    const relation = this.relation(key);
    return relation.query();
  };

  Parse.Query.prototype.where = function where(params = {}) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') this.equalTo(k, v);
    });
    this.equalTo('deleted', false);
    return this;
  };

  Parse.Query.prototype.pagination = async function pagination(currentPage = 1, pageLimit = 10) {
    const current = typeof currentPage === 'string' ? parseInt(currentPage, 10) : currentPage;
    const pageSize = typeof pageLimit === 'string' ? parseInt(pageLimit, 10) : pageLimit;

    const total = await this.count();

    this.skip((current - 1) * pageSize).limit(pageSize);
    const list = await this.find();

    return {
      list,
      pagination: {
        current,
        pageSize,
        total,
      },
    };
  };

  Parse.Query.prototype.findAll = async function findAll() {
    const total = await this.count();

    return this.limit(total).find();
  };

  return Parse;
};
