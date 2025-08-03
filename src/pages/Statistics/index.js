import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Package, Clock, AlertTriangle, Download } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { getExpiryStatus, getExpiryText } from '../../utils/itemUtils';

const Statistics = () => {
  const { items } = useLeanCloudItems();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    totalItems: true,
    expiredItems: true,
    expiringItems: true,
    categoryStats: true,
    brandStats: true
  });

  // 基础统计数据
  const getBasicStats = () => {
    const total = items.length;
    const expired = items.filter(item => getExpiryStatus(item.expiryDate) === 'expired').length;
    const expiringSoon = items.filter(item => getExpiryStatus(item.expiryDate) === 'expiring-soon').length;
    const normal = items.filter(item => getExpiryStatus(item.expiryDate) === 'normal').length;

    return { total, expired, expiringSoon, normal };
  };

  // 分类统计
  const getCategoryStats = () => {
    const categories = ['药品', '护肤品', '食品', '日用品', '其他'];
    return categories.map(category => ({
      name: category,
      count: items.filter(item => item.category === category).length,
      percentage: items.length > 0 ? Math.round((items.filter(item => item.category === category).length / items.length) * 100) : 0
    }));
  };

  // 品牌统计
  const getBrandStats = () => {
    const brands = {};
    items.forEach(item => {
      if (item.brand) {
        brands[item.brand] = (brands[item.brand] || 0) + 1;
      }
    });
    
    return Object.entries(brands)
      .map(([brand, count]) => ({ name: brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 只显示前10个品牌
  };

  // 过期趋势分析
  const getExpiryTrend = () => {
    const now = new Date();
    const trends = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('zh-CN', { month: 'short' });
      
      const monthItems = items.filter(item => {
        const itemDate = new Date(item.expiryDate);
        return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
      });
      
      const expiredCount = monthItems.filter(item => getExpiryStatus(item.expiryDate) === 'expired').length;
      const expiringCount = monthItems.filter(item => getExpiryStatus(item.expiryDate) === 'expiring-soon').length;
      
      trends.unshift({
        month: monthName,
        expired: expiredCount,
        expiring: expiringCount,
        total: monthItems.length
      });
    }
    
    return trends;
  };

  // 消耗模式分析
  const getConsumptionPattern = () => {
    const patterns = {
      '药品': { high: 0, medium: 0, low: 0 },
      '护肤品': { high: 0, medium: 0, low: 0 },
      '食品': { high: 0, medium: 0, low: 0 },
      '日用品': { high: 0, medium: 0, low: 0 },
      '其他': { high: 0, medium: 0, low: 0 }
    };

    items.forEach(item => {
      let consumptionLevel = 'low';
      if (item.quantity >= 10) consumptionLevel = 'high';
      else if (item.quantity >= 5) consumptionLevel = 'medium';
      
      if (patterns[item.category]) {
        patterns[item.category][consumptionLevel]++;
      }
    });

    return patterns;
  };

  // 导出数据
  const exportData = () => {
    const basicStats = getBasicStats();
    const categoryStats = getCategoryStats();
    const brandStats = getBrandStats();
    
    let exportContent = '有期 - 家庭物品管理系统数据导出\n';
    exportContent += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    
    if (exportOptions.totalItems) {
      exportContent += '=== 基础统计 ===\n';
      exportContent += `总物品数: ${basicStats.total}\n`;
      exportContent += `已过期: ${basicStats.expired}\n`;
      exportContent += `即将过期: ${basicStats.expiringSoon}\n`;
      exportContent += `正常: ${basicStats.normal}\n\n`;
    }
    
    if (exportOptions.expiredItems) {
      const expiredItems = items.filter(item => getExpiryStatus(item.expiryDate) === 'expired');
      exportContent += '=== 已过期物品 ===\n';
      expiredItems.forEach(item => {
        exportContent += `${item.name} | ${item.brand || '无品牌'} | ${item.category} | 过期日期: ${item.expiryDate}\n`;
      });
      exportContent += '\n';
    }
    
    if (exportOptions.expiringItems) {
      const expiringItems = items.filter(item => getExpiryStatus(item.expiryDate) === 'expiring-soon');
      exportContent += '=== 即将过期物品 ===\n';
      expiringItems.forEach(item => {
        exportContent += `${item.name} | ${item.brand || '无品牌'} | ${item.category} | 过期日期: ${item.expiryDate}\n`;
      });
      exportContent += '\n';
    }
    
    if (exportOptions.categoryStats) {
      exportContent += '=== 分类统计 ===\n';
      categoryStats.forEach(category => {
        exportContent += `${category.name}: ${category.count} 个 (${category.percentage}%)\n`;
      });
      exportContent += '\n';
    }
    
    if (exportOptions.brandStats) {
      exportContent += '=== 品牌统计 ===\n';
      brandStats.forEach(brand => {
        exportContent += `${brand.name}: ${brand.count} 个物品\n`;
      });
    }
    
    // 创建并下载文件
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `有期数据导出_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportModal(false);
    alert('数据导出成功！');
  };

  const basicStats = getBasicStats();
  const categoryStats = getCategoryStats();
  const brandStats = getBrandStats();
  const expiryTrend = getExpiryTrend();
  const consumptionPattern = getConsumptionPattern();

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>数据统计</h2>
          <button 
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            导出数据
          </button>
        </div>
        
        {/* 时间范围选择 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>统计时间范围：</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="7">最近7天</option>
            <option value="30">最近30天</option>
            <option value="90">最近90天</option>
            <option value="365">最近一年</option>
          </select>
        </div>

        {/* 标签页 - 增大文字按钮 */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{ fontSize: '16px', padding: '12px 20px' }}
          >
            <BarChart3 size={18} style={{ marginRight: '8px' }} />
            概览
          </button>
          <button
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
            style={{ fontSize: '16px', padding: '12px 20px' }}
          >
            <PieChart size={18} style={{ marginRight: '8px' }} />
            分类统计
          </button>
          <button
            className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
            style={{ fontSize: '16px', padding: '12px 20px' }}
          >
            <TrendingUp size={18} style={{ marginRight: '8px' }} />
            趋势分析
          </button>
          <button
            className={`tab ${activeTab === 'consumption' ? 'active' : ''}`}
            onClick={() => setActiveTab('consumption')}
            style={{ fontSize: '16px', padding: '12px 20px' }}
          >
            <Package size={18} style={{ marginRight: '8px' }} />
            消耗模式
          </button>
        </div>

        {/* 概览页面 */}
        {activeTab === 'overview' && (
          <div>
            {/* 基础统计卡片 - 使用绿色主题，减小尺寸 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '30px' }}>
              <div style={{ padding: '15px', background: 'var(--sage-green)', borderRadius: '8px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Package size={20} style={{ marginRight: '8px' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>总物品数</h3>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{basicStats.total}</div>
              </div>
              
              <div style={{ padding: '15px', background: '#dc3545', borderRadius: '8px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <AlertTriangle size={20} style={{ marginRight: '8px' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>已过期</h3>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{basicStats.expired}</div>
              </div>
              
              <div style={{ padding: '15px', background: '#ffc107', borderRadius: '8px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Clock size={20} style={{ marginRight: '8px' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>即将过期</h3>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{basicStats.expiringSoon}</div>
              </div>
              
              <div style={{ padding: '15px', background: '#28a745', borderRadius: '8px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Calendar size={20} style={{ marginRight: '8px' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>正常</h3>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{basicStats.normal}</div>
              </div>
            </div>

            {/* 过期状态饼图 */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>过期状态分布</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    background: 'conic-gradient(#28a745 0deg, #28a745 126deg, #ffc107 126deg, #ffc107 252deg, #dc3545 252deg, #dc3545 360deg)',
                    margin: '0 auto 10px'
                  }}></div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <div>正常: {basicStats.normal} ({Math.round((basicStats.normal / basicStats.total) * 100)}%)</div>
                    <div>即将过期: {basicStats.expiringSoon} ({Math.round((basicStats.expiringSoon / basicStats.total) * 100)}%)</div>
                    <div>已过期: {basicStats.expired} ({Math.round((basicStats.expired / basicStats.total) * 100)}%)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 分类统计页面 */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {categoryStats.map((category, index) => (
                <div key={category.name} style={{ 
                  padding: '15px', 
                  background: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1rem' }}>{category.name}</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--sage-green)', marginBottom: '8px' }}>
                    {category.count}
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    background: '#f0f0f0', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${category.percentage}%`, 
                      height: '100%', 
                      background: 'var(--sage-green)',
                      borderRadius: '3px'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    {category.percentage}% 的总物品
                  </div>
                </div>
              ))}
            </div>

            {/* 品牌统计 */}
            {brandStats.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>品牌分布（前10名）</h3>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                  {brandStats.map((brand, index) => (
                    <div key={brand.name} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: index < brandStats.length - 1 ? '1px solid #e9ecef' : 'none'
                    }}>
                      <span style={{ fontWeight: '500' }}>{brand.name}</span>
                      <span style={{ color: 'var(--sage-green)', fontWeight: 'bold' }}>{brand.count} 个物品</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 趋势分析页面 */}
        {activeTab === 'trends' && (
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>过期趋势分析（最近12个月）</h3>
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>月份</span>
                <span style={{ fontSize: '14px', color: '#666' }}>已过期</span>
                <span style={{ fontSize: '14px', color: '#666' }}>即将过期</span>
                <span style={{ fontSize: '14px', color: '#666' }}>总计</span>
              </div>
              {expiryTrend.map((trend, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < expiryTrend.length - 1 ? '1px solid #e9ecef' : 'none'
                }}>
                  <span style={{ fontWeight: '500', minWidth: '60px' }}>{trend.month}</span>
                  <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{trend.expired}</span>
                  <span style={{ color: '#ffc107', fontWeight: 'bold' }}>{trend.expiring}</span>
                  <span style={{ color: 'var(--sage-green)', fontWeight: 'bold' }}>{trend.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 消耗模式页面 */}
        {activeTab === 'consumption' && (
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>消耗模式分析</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {Object.entries(consumptionPattern).map(([category, pattern]) => (
                <div key={category} style={{ 
                  padding: '15px', 
                  background: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '1rem' }}>{category}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>高消耗 (≥10个)</span>
                    <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{pattern.high}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    background: '#f0f0f0', 
                    borderRadius: '2px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ 
                      width: `${pattern.high > 0 ? (pattern.high / (pattern.high + pattern.medium + pattern.low)) * 100 : 0}%`, 
                      height: '100%', 
                      background: '#dc3545',
                      borderRadius: '2px'
                    }}></div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>中等消耗 (5-9个)</span>
                    <span style={{ color: '#ffc107', fontWeight: 'bold' }}>{pattern.medium}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    background: '#f0f0f0', 
                    borderRadius: '2px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ 
                      width: `${pattern.medium > 0 ? (pattern.medium / (pattern.high + pattern.medium + pattern.low)) * 100 : 0}%`, 
                      height: '100%', 
                      background: '#ffc107',
                      borderRadius: '2px'
                    }}></div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>低消耗 (1-4个)</span>
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>{pattern.low}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    background: '#f0f0f0', 
                    borderRadius: '2px'
                  }}>
                    <div style={{ 
                      width: `${pattern.low > 0 ? (pattern.low / (pattern.high + pattern.medium + pattern.low)) * 100 : 0}%`, 
                      height: '100%', 
                      background: '#28a745',
                      borderRadius: '2px'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 数据导出模态框 */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>选择导出内容</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={exportOptions.totalItems}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, totalItems: e.target.checked }))}
                  style={{ marginRight: '10px' }}
                />
                基础统计信息
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={exportOptions.expiredItems}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, expiredItems: e.target.checked }))}
                  style={{ marginRight: '10px' }}
                />
                已过期物品列表
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={exportOptions.expiringItems}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, expiringItems: e.target.checked }))}
                  style={{ marginRight: '10px' }}
                />
                即将过期物品列表
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={exportOptions.categoryStats}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, categoryStats: e.target.checked }))}
                  style={{ marginRight: '10px' }}
                />
                分类统计
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={exportOptions.brandStats}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, brandStats: e.target.checked }))}
                  style={{ marginRight: '10px' }}
                />
                品牌统计
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowExportModal(false)}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={exportData}
                className="btn"
                style={{ background: 'var(--sage-green)', color: 'white' }}
              >
                导出数据
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics; 