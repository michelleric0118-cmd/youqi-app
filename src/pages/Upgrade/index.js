import React, { useState } from 'react';

const PlanCard = ({ name, price, features, onSelect, highlighted }) => (
  <div style={{ flex: 1, border: highlighted ? '2px solid var(--sage-green)' : '1px solid #eee', borderRadius: 12, padding: 20 }}>
    <h3 style={{ marginTop: 0 }}>{name}</h3>
    <div style={{ fontSize: 24, fontWeight: 700, margin: '8px 0' }}>{price}</div>
    <ul>
      {features.map((f, i) => <li key={i}>{f}</li>)}
    </ul>
    <button className="btn" style={{ background: 'var(--sage-green)', color: '#fff', marginTop: 12 }} onClick={onSelect}>选择{name}</button>
  </div>
);

const UpgradePage = () => {
  const [selected, setSelected] = useState(null);

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [placing, setPlacing] = useState(false);
  const selectPlan = (plan) => setSelected(plan);

  const placeOrder = async () => {
    if (!selected) { alert('请先选择套餐'); return; }
    setPlacing(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('leancloud-session');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/order/place', { method: 'POST', headers, body: JSON.stringify({ plan: selected, contact, note: 'beta-order' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');
      alert('下单成功，已提交开通请求。我们将尽快联系您完成开通。');
    } catch (e) {
      alert(e.message || '下单失败，请稍后重试');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>升级套餐</h2>
      <p style={{ color: '#555' }}>内测版每用户每月包含 40 次 OCR 识别。升级可获得更多额度和功能。</p>

      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        <PlanCard
          name="基础版"
          price="¥9/月"
          features={["每月 200 次 OCR", "批量 OCR", "优先队列"]}
          onSelect={() => selectPlan('基础版')}
        />
        <PlanCard
          name="专业版"
          price="¥29/月"
          features={["每月 1000 次 OCR", "PDF/多页识别", "家庭协作（2人）"]}
          onSelect={() => selectPlan('专业版')}
          highlighted
        />
        <PlanCard
          name="企业版"
          price="定制"
          features={["按需额度", "私有化部署/专线", "团队与权限管理"]}
          onSelect={() => selectPlan('企业版')}
        />
      </div>

      <div style={{ marginTop: 32, background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
        <h3>联系开通</h3>
        <p>请选择套餐并填写联系方式，我们会尽快与您对接完成开通。</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          <input placeholder="联系人" value={contact.name} onChange={e=>setContact({ ...contact, name: e.target.value })} />
          <input placeholder="邮箱" value={contact.email} onChange={e=>setContact({ ...contact, email: e.target.value })} />
          <input placeholder="电话/微信" value={contact.phone} onChange={e=>setContact({ ...contact, phone: e.target.value })} />
        </div>
        <button disabled={placing} className="btn" style={{ background: 'var(--sage-green)', color: '#fff', marginTop: 12 }} onClick={placeOrder}>{placing ? '提交中...' : '提交开通请求'}</button>
      </div>
    </div>
  );
};

export default UpgradePage;
