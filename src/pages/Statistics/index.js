import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Package, Clock, AlertTriangle, Download, HelpCircle } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { getExpiryStatus } from '../../utils/itemUtils';
import { useNavigate } from 'react-router-dom';
import ExpiryTrendChart from '../../components/charts/ExpiryTrendChart';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import ConsumptionBarChart from '../../components/charts/ConsumptionBarChart';
import BrandBarChart from '../../components/charts/BrandBarChart';

const Statistics = () => {
  const { items } = useLeanCloudItems();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTimeRangeHelp, setShowTimeRangeHelp] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    totalItems: true,
    expiredItems: true,
    expiringItems: true,
    categoryStats: true,
    brandStats: true
  });

  // 卡片点击处理函数
  const handleCardClick = (filterType) => {
    navigate(`/items?filter=${filterType}`);
  };

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
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '10px 16px',
              background: '#4A4A4A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#333333';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#4A4A4A';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Download size={16} />
            导出数据
          </button>
        </div>
        
        {/* 时间范围选择 */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: '500', color: '#333' }}>统计时间范围：</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #ddd', 
                borderRadius: '6px',
                background: 'white',
                fontSize: '14px'
              }}
            >
              <option value="7">最近7天</option>
              <option value="30">最近30天</option>
              <option value="90">最近90天</option>
              <option value="365">最近一年</option>
            </select>
            <button
              onClick={() => setShowTimeRangeHelp(!showTimeRangeHelp)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.color = '#8A9A5B';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#666';
              }}
            >
              <HelpCircle size={16} />
            </button>
          </div>
          {showTimeRangeHelp && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              background: 'white',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: '14px',
              color: '#666',
              maxWidth: '300px',
              zIndex: 1000,
              marginTop: '8px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '6px', color: '#333' }}>时间范围说明</div>
              <div>此时间范围仅影响"趋势分析"和"消耗模式"页面的数据。概览和分类统计页面显示所有时间的数据。</div>
            </div>
          )}
        </div>

        {/* 标签页 - 下划线样式 */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #E0E0E0', 
          marginBottom: '24px',
          gap: '32px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{ 
              fontSize: '16px', 
              padding: '12px 0', 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'overview' ? '#8A9A5B' : '#666',
              fontWeight: activeTab === 'overview' ? '600' : '400',
              borderBottom: activeTab === 'overview' ? '3px solid #8A9A5B' : '3px solid transparent',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <BarChart3 size={18} />
            概览
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{ 
              fontSize: '16px', 
              padding: '12px 0', 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'categories' ? '#8A9A5B' : '#666',
              fontWeight: activeTab === 'categories' ? '600' : '400',
              borderBottom: activeTab === 'categories' ? '3px solid #8A9A5B' : '3px solid transparent',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <PieChart size={18} />
            分类统计
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            style={{ 
              fontSize: '16px', 
              padding: '12px 0', 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'trends' ? '#8A9A5B' : '#666',
              fontWeight: activeTab === 'trends' ? '600' : '400',
              borderBottom: activeTab === 'trends' ? '3px solid #8A9A5B' : '3px solid transparent',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp size={18} />
            趋势分析
          </button>
          <button
            onClick={() => setActiveTab('consumption')}
            style={{ 
              fontSize: '16px', 
              padding: '12px 0', 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'consumption' ? '#8A9A5B' : '#666',
              fontWeight: activeTab === 'consumption' ? '600' : '400',
              borderBottom: activeTab === 'consumption' ? '3px solid #8A9A5B' : '3px solid transparent',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Package size={18} />
            消耗模式
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            style={{ 
              fontSize: '16px', 
              padding: '12px 0', 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'advanced' ? '#8A9A5B' : '#666',
              fontWeight: activeTab === 'advanced' ? '600' : '400',
              borderBottom: activeTab === 'advanced' ? '3px solid #8A9A5B' : '3px solid transparent',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <BarChart3 size={18} />
            高级分析
          </button>
        </div>

        {/* 概览页面 */}
        {activeTab === 'overview' && (
          <div>
            {/* 基础统计卡片 - 使用新的配色方案，可点击 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
              {/* 总物品数卡片 */}
              <div 
                style={{ 
                  padding: '20px', 
                  background: '#F5F5F5', 
                  borderRadius: '12px', 
                  color: '#4A4A4A',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #E0E0E0'
                }}
                onClick={() => handleCardClick('all')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <Package size={28} style={{ marginRight: '12px' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>总物品数</h3>
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>{basicStats.total}</div>
                <div style={{ fontSize: '14px', opacity: '0.7' }}>点击查看全部物品</div>
              </div>
              
              {/* 已过期卡片 */}
              <div 
                style={{ 
                  padding: '20px', 
                  background: '#CB4154', 
                  borderRadius: '12px', 
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onClick={() => handleCardClick('expired')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <AlertTriangle size={28} style={{ marginRight: '12px' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>已过期</h3>
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>{basicStats.expired}</div>
                <div style={{ fontSize: '14px', opacity: '0.9' }}>点击查看过期物品</div>
              </div>
              
              {/* 即将过期卡片 */}
              <div 
                style={{ 
                  padding: '20px', 
                  background: '#E89F65', 
                  borderRadius: '12px', 
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onClick={() => handleCardClick('expiring-soon')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <Clock size={28} style={{ marginRight: '12px' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>即将过期</h3>
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>{basicStats.expiringSoon}</div>
                <div style={{ fontSize: '14px', opacity: '0.9' }}>点击查看即将过期物品</div>
              </div>
              
              {/* 正常卡片 */}
              <div 
                style={{ 
                  padding: '20px', 
                  background: '#8A9A5B', 
                  borderRadius: '12px', 
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onClick={() => handleCardClick('normal')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <Calendar size={28} style={{ marginRight: '12px' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>正常</h3>
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>{basicStats.normal}</div>
                <div style={{ fontSize: '14px', opacity: '0.9' }}>点击查看正常物品</div>
              </div>
            </div>

            {/* 过期状态饼图 - 使用新的配色方案 */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>过期状态分布</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%', 
                    background: `conic-gradient(
                      #8A9A5B 0deg, 
                      #8A9A5B ${(basicStats.normal / basicStats.total) * 360}deg, 
                      #E89F65 ${(basicStats.normal / basicStats.total) * 360}deg, 
                      #E89F65 ${((basicStats.normal + basicStats.expiringSoon) / basicStats.total) * 360}deg, 
                      #CB4154 ${((basicStats.normal + basicStats.expiringSoon) / basicStats.total) * 360}deg, 
                      #CB4154 360deg
                    )`,
                    margin: '0 auto 15px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}></div>
                  <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <div style={{ width: '12px', height: '12px', background: '#8A9A5B', borderRadius: '2px', marginRight: '8px' }}></div>
                      正常: {basicStats.normal} ({Math.round((basicStats.normal / basicStats.total) * 100)}%)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <div style={{ width: '12px', height: '12px', background: '#E89F65', borderRadius: '2px', marginRight: '8px' }}></div>
                      即将过期: {basicStats.expiringSoon} ({Math.round((basicStats.expiringSoon / basicStats.total) * 100)}%)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '12px', height: '12px', background: '#CB4154', borderRadius: '2px', marginRight: '8px' }}></div>
                      已过期: {basicStats.expired} ({Math.round((basicStats.expired / basicStats.total) * 100)}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 分类统计页面 */}
        {activeTab === 'categories' && (
          <div>
            {/* 分类饼图 */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
                分类分布饼图
              </h3>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CategoryPieChart data={categoryStats} />
              </div>
            </div>

            {/* 分类卡片 */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
                分类详细统计
              </h3>
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
            </div>

            {/* 品牌统计图表 */}
            {brandStats.length > 0 && (
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
                  品牌分布柱状图（前10名）
                </h3>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <BrandBarChart data={brandStats} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 趋势分析页面 */}
        {activeTab === 'trends' && (
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
              过期趋势分析（最近12个月）
            </h3>
            
            {/* 趋势图表 */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <ExpiryTrendChart data={expiryTrend} />
              </div>
            </div>

            {/* 趋势数据表格 */}
            <div>
              <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                详细数据
              </h4>
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>月份</span>
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>已过期</span>
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>即将过期</span>
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>总计</span>
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
          </div>
        )}

        {/* 消耗模式页面 */}
        {activeTab === 'consumption' && (
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
              消耗模式分析
            </h3>
            
            {/* 消耗模式柱状图 */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <ConsumptionBarChart data={Object.entries(consumptionPattern).map(([category, pattern]) => ({
                  category,
                  high: pattern.high,
                  medium: pattern.medium,
                  low: pattern.low
                }))} />
              </div>
            </div>

            {/* 消耗模式详细卡片 */}
            <div>
              <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                详细分析
              </h4>
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
          </div>
        )}

        {/* 高级分析页面 */}
        {activeTab === 'advanced' && (
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
              高级统计分析
            </h3>
            
            {/* 时间范围筛选 */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Calendar size={20} color="#666" />
                <label style={{ fontWeight: '500', color: '#333' }}>分析时间范围：</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '6px',
                    background: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="7">最近7天</option>
                  <option value="30">最近30天</option>
                  <option value="90">最近90天</option>
                  <option value="365">最近一年</option>
                  <option value="all">全部时间</option>
                </select>
              </div>
            </div>

            {/* 过期预警统计 */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ 
                margin: '0 0 16px 0', 
                color: '#333', 
                fontSize: '16px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={18} color="#CB4154" />
                过期预警统计
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '12px' 
              }}>
                <div style={{ 
                  padding: '16px', 
                  background: '#CB4154', 
                  borderRadius: '8px', 
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {items.filter(item => getExpiryStatus(item.expiryDate) === 'expired').length}
                  </div>
                  <div style={{ fontSize: '12px' }}>已过期</div>
                </div>
                <div style={{ 
                  padding: '16px', 
                  background: '#E89F65', 
                  borderRadius: '8px', 
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {items.filter(item => {
                      const expiryDate = new Date(item.expiryDate);
                      const today = new Date();
                      return expiryDate.toDateString() === today.toDateString();
                    }).length}
                  </div>
                  <div style={{ fontSize: '12px' }}>今日过期</div>
                </div>
                <div style={{ 
                  padding: '16px', 
                  background: '#FFD700', 
                  borderRadius: '8px', 
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {items.filter(item => {
                      const expiryDate = new Date(item.expiryDate);
                      const today = new Date();
                      const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return expiryDate > today && expiryDate <= weekLater;
                    }).length}
                  </div>
                  <div style={{ fontSize: '12px' }}>本周过期</div>
                </div>
                <div style={{ 
                  padding: '16px', 
                  background: '#8A9A5B', 
                  borderRadius: '8px', 
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {items.filter(item => {
                      const expiryDate = new Date(item.expiryDate);
                      const today = new Date();
                      const monthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                      return expiryDate > today && expiryDate <= monthLater;
                    }).length}
                  </div>
                  <div style={{ fontSize: '12px' }}>本月过期</div>
                </div>
              </div>
            </div>

            {/* 品牌使用频率 */}
            {brandStats.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  color: '#333', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Package size={18} color="#8A9A5B" />
                  品牌使用频率 (前10名)
                </h4>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '20px', 
                  borderRadius: '12px',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  {brandStats.map((brand, index) => (
                    <div key={brand.name} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: index < brandStats.length - 1 ? '1px solid #e9ecef' : 'none'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                          {brand.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          使用频率: {Math.round((brand.count / items.length) * 100)}%
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8A9A5B' }}>
                          {brand.count} 个
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 数据洞察 */}
            <div>
              <h4 style={{ 
                margin: '0 0 16px 0', 
                color: '#333', 
                fontSize: '16px', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TrendingUp size={18} color="#4A90E2" />
                数据洞察
              </h4>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ 
                    padding: '16px', 
                    background: 'white', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px', fontWeight: '600' }}>
                      平均过期时间
                    </h5>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8A9A5B' }}>
                      {Math.round(items.reduce((acc, item) => {
                        const expiryDate = new Date(item.expiryDate);
                        const today = new Date();
                        return acc + Math.max(0, (expiryDate - today) / (1000 * 60 * 60 * 24));
                      }, 0) / Math.max(1, items.length))} 天
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '16px', 
                    background: 'white', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px', fontWeight: '600' }}>
                      过期风险指数
                    </h5>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#CB4154' }}>
                      {Math.round((items.filter(item => getExpiryStatus(item.expiryDate) === 'expired').length / Math.max(1, items.length)) * 100)}%
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '16px', 
                    background: 'white', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px', fontWeight: '600' }}>
                      最受欢迎分类
                    </h5>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8A9A5B' }}>
                      {categoryStats.length > 0 ? categoryStats[0].name : '无数据'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {categoryStats.length > 0 ? `${categoryStats[0].count} 个物品` : ''}
                    </div>
                  </div>
                </div>
              </div>
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