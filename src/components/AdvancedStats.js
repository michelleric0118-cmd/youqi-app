import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, AlertTriangle, Package, Clock, BarChart3 } from 'lucide-react';
import { getExpiryStatus } from '../utils/itemUtils';

const AdvancedStats = ({ items, timeRange }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange || '30');

  // 根据时间范围筛选数据
  const filteredItems = useMemo(() => {
    if (!selectedTimeRange || selectedTimeRange === 'all') return items;
    
    const now = new Date();
    const daysAgo = parseInt(selectedTimeRange);
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return items.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= cutoffDate;
    });
  }, [items, selectedTimeRange]);

  // 品牌使用频率分析
  const getBrandFrequency = () => {
    const brandStats = {};
    filteredItems.forEach(item => {
      if (item.brand) {
        if (!brandStats[item.brand]) {
          brandStats[item.brand] = {
            count: 0,
            categories: new Set(),
            totalQuantity: 0
          };
        }
        brandStats[item.brand].count++;
        brandStats[item.brand].categories.add(item.category);
        brandStats[item.brand].totalQuantity += item.quantity || 1;
      }
    });

    return Object.entries(brandStats)
      .map(([brand, stats]) => ({
        name: brand,
        count: stats.count,
        categories: Array.from(stats.categories),
        totalQuantity: stats.totalQuantity,
        avgQuantity: Math.round(stats.totalQuantity / stats.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // 过期预警统计
  const getExpiryWarningStats = () => {
    const now = new Date();
    const warningStats = {
      expired: 0,
      expiringToday: 0,
      expiringThisWeek: 0,
      expiringThisMonth: 0,
      expiringNextMonth: 0
    };

    filteredItems.forEach(item => {
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        warningStats.expired++;
      } else if (daysUntilExpiry === 0) {
        warningStats.expiringToday++;
      } else if (daysUntilExpiry <= 7) {
        warningStats.expiringThisWeek++;
      } else if (daysUntilExpiry <= 30) {
        warningStats.expiringThisMonth++;
      } else if (daysUntilExpiry <= 60) {
        warningStats.expiringNextMonth++;
      }
    });

    return warningStats;
  };

  const brandFrequency = getBrandFrequency();
  const expiryWarningStats = getExpiryWarningStats();

  return (
    <div>
      {/* 时间范围选择器 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Calendar size={20} color="#666" />
          <label style={{ fontWeight: '500', color: '#333' }}>分析时间范围：</label>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
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
        <div style={{ fontSize: '14px', color: '#666' }}>
          当前分析范围：{selectedTimeRange === 'all' ? '全部时间' : `最近${selectedTimeRange}天`} 
          (共 {filteredItems.length} 个物品)
        </div>
      </div>

      {/* 过期预警统计 */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: '#333', 
          fontSize: '18px', 
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={20} color="#CB4154" />
          过期预警统计
        </h3>
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
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{expiryWarningStats.expired}</div>
            <div style={{ fontSize: '12px' }}>已过期</div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: '#E89F65', 
            borderRadius: '8px', 
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{expiryWarningStats.expiringToday}</div>
            <div style={{ fontSize: '12px' }}>今日过期</div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: '#FFD700', 
            borderRadius: '8px', 
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{expiryWarningStats.expiringThisWeek}</div>
            <div style={{ fontSize: '12px' }}>本周过期</div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: '#8A9A5B', 
            borderRadius: '8px', 
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{expiryWarningStats.expiringThisMonth}</div>
            <div style={{ fontSize: '12px' }}>本月过期</div>
          </div>
        </div>
      </div>

      {/* 品牌使用频率 */}
      {brandFrequency.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#333', 
            fontSize: '18px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Package size={20} color="#8A9A5B" />
            品牌使用频率 (前10名)
          </h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '12px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {brandFrequency.map((brand, index) => (
              <div key={brand.name} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: index < brandFrequency.length - 1 ? '1px solid #e9ecef' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    {brand.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {brand.categories.join(', ')} | 平均数量: {brand.avgQuantity}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8A9A5B' }}>
                    {brand.count} 个
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    总数量: {brand.totalQuantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedStats; 