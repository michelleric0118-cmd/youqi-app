import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Package, Clock, AlertTriangle, Download, HelpCircle } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { getExpiryStatus } from '../../utils/itemUtils';
import { useNavigate } from 'react-router-dom';
import ExpiryTrendChart from '../../components/charts/ExpiryTrendChart';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import ConsumptionBarChart from '../../components/charts/ConsumptionBarChart';
import BrandBarChart from '../../components/charts/BrandBarChart';
import AdvancedStats from '../../components/AdvancedStats';
import './Statistics.css';

const Statistics = () => {
  const { items, loading, error } = useLeanCloudItems();
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTimeRangeHelp, setShowTimeRangeHelp] = useState(false);
  const [timeRange, setTimeRange] = useState(30);
  
  // 移除activeTab状态，简化页面结构
  // const [activeTab, setActiveTab] = useState('overview');
  const [exportOptions, setExportOptions] = useState({
    totalItems: true,
    expiredItems: true,
    expiringItems: true,
    categoryStats: true,
    brandStats: true
  });

  // 错误处理
  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#dc2626',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>数据加载失败</h3>
        <p>抱歉，统计数据无法加载。请检查网络连接或稍后重试。</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          刷新页面
        </button>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          返回首页
        </button>
      </div>
    );
  }

  // 加载状态
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="loading-spinner-container">
          <div className="animate-spin" style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%'
          }}></div>
        </div>
        <p style={{ color: '#6b7280' }}>正在加载统计数据...</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          强制刷新
        </button>
      </div>
    );
  }

  // 确保items是数组
  const safeItems = Array.isArray(items) ? items : [];

  // 调试信息
  console.log('Statistics页面渲染:', { 
    items: safeItems.length, 
    loading, 
    error, 
    // activeTab 
  });

  // 卡片点击处理函数
  const handleCardClick = (filterType) => {
    navigate(`/items?filter=${filterType}`);
  };

  // 基础统计数据
  const getBasicStats = () => {
    const total = safeItems.length;
    const expired = safeItems.filter(item => getExpiryStatus(item.expiryDate) === 'expired').length;
    const expiringSoon = safeItems.filter(item => getExpiryStatus(item.expiryDate) === 'expiring-soon').length;
    const normal = safeItems.filter(item => getExpiryStatus(item.expiryDate) === 'normal').length;

    return { total, expired, expiringSoon, normal };
  };

  // 分类统计
  const getCategoryStats = () => {
    const categories = ['药品', '护肤品', '食品', '日用品', '其他'];
    return categories.map(category => ({
      name: category,
      count: safeItems.filter(item => item.category === category).length,
      percentage: safeItems.length > 0 ? Math.round((safeItems.filter(item => item.category === category).length / safeItems.length) * 100) : 0
    }));
  };

  // 品牌统计
  const getBrandStats = () => {
    const brands = {};
    safeItems.forEach(item => {
      if (item.brand) {
        brands[item.brand] = (brands[item.brand] || 0) + 1;
      }
    });
    
    return Object.entries(brands)
      .map(([brand, count]) => ({ name: brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // 过期趋势分析
  const getExpiryTrend = () => {
    const now = new Date();
    const trends = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('zh-CN', { month: 'short' });
      
      const monthItems = safeItems.filter(item => {
        if (!item.expiryDate) return false;
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

    safeItems.forEach(item => {
      if (item.category && patterns[item.category]) {
        const quantity = parseInt(item.quantity) || 0;
        if (quantity > 10) {
          patterns[item.category].high++;
        } else if (quantity > 3) {
          patterns[item.category].medium++;
        } else {
          patterns[item.category].low++;
        }
      }
    });

    return patterns;
  };

  const basicStats = getBasicStats();
  const categoryStats = getCategoryStats();
  const brandStats = getBrandStats();
  const expiryTrend = getExpiryTrend();
  const consumptionPattern = getConsumptionPattern();

  const exportData = () => {
    const exportData = {
      basicStats,
      categoryStats,
      brandStats,
      expiryTrend,
      consumptionPattern,
      items
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `youqi-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div className="statistics-page">
      {/* 调试信息 - 已删除，对普通用户来说是多余的 */}
      
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

      {/* 标签页 - 已简化，移除重复导航 */}
      {/* <div style={{ 
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
          <BarChart3 size={18} />
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
      </div> */}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 页面标题 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          padding: '20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '28px', fontWeight: '600' }}>
              数据统计
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              查看物品过期情况、分类统计和趋势分析
            </p>
          </div>
          
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#8A9A5B',
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
              e.target.style.background = '#8A9A5B';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Download size={16} />
            导出数据
          </button>
        </div>
        
        {/* 概览页面 - 已整合到主页面 */}
        <div>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
            数据概览
          </h3>
          
          {/* 统计卡片 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            <div 
              onClick={() => handleCardClick('all')}
              style={{ 
                padding: '20px', 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid #e9ecef'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#8A9A5B', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Package size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    {basicStats.total}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>总物品数</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleCardClick('expired')}
              style={{ 
                padding: '20px', 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid #e9ecef'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#CB4154', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <AlertTriangle size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    {basicStats.expired}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>已过期</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleCardClick('expiring-soon')}
              style={{ 
                padding: '20px', 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid #e9ecef'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#E89F65', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Clock size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    {basicStats.expiringSoon}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>即将过期</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleCardClick('normal')}
              style={{ 
                padding: '20px', 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid #e9ecef'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#28a745', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Calendar size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    {basicStats.normal}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>正常状态</div>
                </div>
              </div>
            </div>
          </div>

          {/* 分类统计卡片 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            {categoryStats.map((category, index) => (
              <div key={category.name} style={{ 
                padding: '16px', 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '8px' 
                }}>
                  <span style={{ fontWeight: '600', color: '#333' }}>{category.name}</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#8A9A5B' }}>
                    {category.count}
                  </span>
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
                    background: `hsl(${index * 60}, 70%, 60%)`,
                    borderRadius: '3px'
                  }}></div>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {category.percentage}% 的总数
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 分类统计页面 - 已整合到主页面 */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
            分类统计
          </h3>
          
          {/* 分类饼图 */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CategoryPieChart data={categoryStats} />
            </div>
          </div>

          {/* 品牌统计 */}
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
                品牌统计 (前10名)
              </h4>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <BrandBarChart data={brandStats} />
              </div>
            </div>
          )}
        </div>

        {/* 趋势分析页面 - 已整合到主页面 */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
            过期趋势分析
          </h3>
          
          {/* 趋势图表 */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <ExpiryTrendChart data={expiryTrend} />
            </div>
          </div>
        </div>

        {/* 消耗模式页面 - 已整合到主页面 */}
        <div style={{ marginBottom: '40px' }}>
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
        </div>

        {/* 高级分析页面 - 已整合到主页面 */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
            高级分析
          </h3>
          <AdvancedStats items={items} />
        </div>
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