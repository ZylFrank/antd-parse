import Parse from 'parse';

Parse.initialize(APP_ID);
Parse.serverURL = `${SERVER_URL}:${SERVER_PORT}/api`;

Parse.Object.prototype.insertOne = function insertOne(values = {}) {
  this.set('deleted', false);
  return this.save(values);
};

Parse.Object.prototype.deletedOne = function deletedOne() {
  this.set('deleted', true);
  return this.save();
};

Parse.Object.prototype.addFile = async function addFile(file, key, extra) {
  const { name, type, size } = file;
  const extname = name.slice(name.lastIndexOf('.'));
  const newFile = await new Parse.File('file', file, type).save();
  const url = newFile.url();
  const fileObject = await new Parse.Object('File').insertOne({
    name,
    type,
    size,
    extname,
    url,
    data: newFile,
    ...extra,
  });
  const k = typeof key === 'string' ? key : 'file';
  this.set(k, fileObject);
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

export default Parse;
