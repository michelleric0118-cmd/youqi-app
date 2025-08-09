import { AV, initLeanCloud } from '../leancloud/config';

const CLASS = 'UserCategory';

export const ensureInit = () => { try { initLeanCloud(); } catch (_) {} };

export const listUserCategories = async (user) => {
  ensureInit();
  const current = user || (AV.User.current && AV.User.current());
  if (!current) return [];
  const Query = new AV.Query(CLASS);
  Query.equalTo('owner', current);
  Query.ascending('order');
  const results = await Query.find();
  return results.map(r => ({
    id: r.id,
    value: r.get('value'),
    label: r.get('label') || r.get('value'),
    order: r.get('order') || 0,
    parent: r.get('parent') ? { id: r.get('parent').id, label: r.get('parent').get('label') || r.get('parent').get('value') } : null
  }));
};

export const createUserCategory = async (label, parentId) => {
  ensureInit();
  const owner = AV.User.current();
  if (!owner) throw new Error('未登录');
  const Cat = AV.Object.extend(CLASS);
  const obj = new Cat();
  obj.set('owner', owner);
  obj.set('value', label);
  obj.set('label', label);
  if (parentId) {
    const parent = AV.Object.createWithoutData(CLASS, parentId);
    obj.set('parent', parent);
  }
  // ACL：仅本人可读写
  const acl = new AV.ACL();
  acl.setReadAccess(owner, true);
  acl.setWriteAccess(owner, true);
  obj.setACL(acl);
  await obj.save();
  return obj;
};

export const deleteUserCategory = async (id) => {
  ensureInit();
  const obj = AV.Object.createWithoutData(CLASS, id);
  await obj.destroy();
};

export const renameUserCategory = async (id, newLabel) => {
  ensureInit();
  const obj = AV.Object.createWithoutData(CLASS, id);
  obj.set('label', newLabel);
  obj.set('value', newLabel);
  await obj.save();
};

export const setCategoryOrder = async (id, order) => {
  ensureInit();
  const obj = AV.Object.createWithoutData(CLASS, id);
  obj.set('order', Number(order) || 0);
  await obj.save();
};

