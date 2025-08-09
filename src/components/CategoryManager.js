import React, { useEffect, useState } from 'react';
import { listUserCategories, createUserCategory, deleteUserCategory, renameUserCategory, setCategoryOrder } from '../services/categoryService';

const CategoryManager = ({ onClose }) => {
  const [list, setList] = useState([]);
  const [newName, setNewName] = useState('');
  const [parentId, setParentId] = useState('');

  const refresh = async () => {
    const data = await listUserCategories();
    setList(data);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="user-management-overlay">
      <div className="user-management-modal">
        <div className="user-management-header">
          <h3>分类管理</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="user-management-content">
          <div className="invite-section">
            <h4>新增分类</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="分类名称" value={newName} onChange={e=>setNewName(e.target.value)} />
              <select value={parentId} onChange={e=>setParentId(e.target.value)}>
                <option value="">无父级</option>
                {list.map(c => (<option key={c.id} value={c.id}>{c.label}</option>))}
              </select>
              <button className="btn" onClick={async ()=>{ if(!newName.trim()) return; await createUserCategory(newName.trim(), parentId || undefined); setNewName(''); setParentId(''); await refresh(); }}>新增</button>
            </div>
          </div>

          <div className="users-section">
            <h4>我的分类</h4>
            <div className="users-list">
              {list.map(cat => (
                <div key={cat.id} className="user-item" style={{ alignItems: 'center' }}>
                  <div className="user-details">
                    <div className="user-name">{cat.label}{cat.parent ? `（父级：${cat.parent.label}）` : ''}</div>
                  </div>
                  <div className="user-actions" style={{ gap: 6 }}>
                    <input type="number" defaultValue={cat.order || 0} style={{ width: 64 }} onBlur={async (e)=>{ await setCategoryOrder(cat.id, e.target.value); await refresh(); }} />
                    <button className="btn-secondary" onClick={async ()=>{ const name = window.prompt('重命名', cat.label); if(name){ await renameUserCategory(cat.id, name); await refresh(); } }}>重命名</button>
                    <button className="delete-user-btn" onClick={async ()=>{ if(window.confirm('确定删除该分类？')){ await deleteUserCategory(cat.id); await refresh(); }}}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
