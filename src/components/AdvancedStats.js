import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Package, 
  Clock, 
  AlertTriangle, 
  Download, 
  HelpCircle,
  DollarSign,
  Target,
  Activity,
  Users,
  MapPin,
  ShoppingCart,
  Star,
  Zap,
  Shield
} from 'lucide-react';
import { getExpiryStatus } from '../utils/itemUtils';
import dataExportManager from '../utils/dataExport';
import './AdvancedStats.css';

const AdvancedStats = ({ items = [] }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 时间范围选项
  const timeRanges = [
    { value: '7', label: '最近7天' },
    { value: '30', label: '最近30天' },
    { value: '90', label: '最近90天' },
    { value: '365', label: '最近一年' },
    { value: 'all', label: '全部时间' }
  ];

  // 过滤数据
  const filteredItems = useMemo(() => {
    let filtered = items;

    // 按时间范围过滤
    if (selectedTimeRange !== 'all') {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(selectedTimeRange));
      filtered = filtered.filter(item => new Date(item.createdAt) >= daysAgo);
    }

    // 按分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    return filtered;
  }, [items, selectedTimeRange, selectedCategory]);

  // 基础统计指标
  const basicStats = useMemo(() => {
    const total = filteredItems.length;
    const expired = filteredItems.filter(item => getExpiryStatus(item.expiryDate) === 'expired').length;
    const expiringSoon = filteredItems.filter(item => getExpiryStatus(item.expiryDate) === 'expiring-soon').length;
    const normal = filteredItems.filter(item => getExpiryStatus(item.expiryDate) === 'normal').length;
    const expiringRate = total > 0 ? ((expired + expiringSoon) / total * 100).toFixed(1) : 0;

    return { total, expired, expiringSoon, normal, expiringRate };
  }, [filteredItems]);

  // 价值分析
  const valueStats = useMemo(() => {
    const totalValue = filteredItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    const avgValue = filteredItems.length > 0 ? totalValue / filteredItems.length : 0;
    const highValueItems = filteredItems.filter(item => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return (price * quantity) > 100;
    }).length;

    return { totalValue, avgValue, highValueItems };
  }, [filteredItems]);

  // 品牌分析
  const brandStats = useMemo(() => {
    const brands = {};
    
    filteredItems.forEach(item => {
      const brand = item.brand || '未知品牌';
      if (!brands[brand]) {
        brands[brand] = {
          count: 0,
          totalValue: 0,
          expiredCount: 0
        };
      }
      
      brands[brand].count++;
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      brands[brand].totalValue += price * quantity;
      
      const status = getExpiryStatus(item.expiryDate);
      if (status === 'expired') {
        brands[brand].expiredCount++;
      }
    });

    return Object.entries(brands)
      .map(([brand, stats]) => ({
        name: brand,
        ...stats,
        avgValue: stats.count > 0 ? stats.totalValue / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredItems]);

  // 导出数据
  const handleExport = () => {
    const exportData = {
      basicStats,
      valueStats,
      brandStats,
      filteredItems
    };

    dataExportManager.exportData(exportData, 'json');
  };

  return (
    <div className="advanced-stats">
      <div className="stats-header">
        <h2>高级统计分析</h2>
        <div className="stats-controls">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="time-range-select"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">全部分类</option>
            <option value="药品">药品</option>
            <option value="护肤品">护肤品</option>
            <option value="食品">食品</option>
            <option value="日用品">日用品</option>
            <option value="其他">其他</option>
          </select>
          
          <button 
            onClick={handleExport}
            className="export-btn"
          >
            <Download size={16} />
            导出数据
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {/* 基础统计卡片 */}
        <div className="stats-card basic-stats">
          <h3>基础统计</h3>
          <div className="stats-metrics">
            <div className="metric">
              <Package size={20} />
              <span>总数: {basicStats.total}</span>
            </div>
            <div className="metric">
              <AlertTriangle size={20} />
              <span>已过期: {basicStats.expired}</span>
            </div>
            <div className="metric">
              <Clock size={20} />
              <span>即将过期: {basicStats.expiringSoon}</span>
            </div>
            <div className="metric">
              <Target size={20} />
              <span>过期率: {basicStats.expiringRate}%</span>
            </div>
          </div>
        </div>

        {/* 价值分析卡片 */}
        <div className="stats-card value-stats">
          <h3>价值分析</h3>
          <div className="stats-metrics">
            <div className="metric">
              <DollarSign size={20} />
              <span>总价值: ¥{valueStats.totalValue.toFixed(2)}</span>
            </div>
            <div className="metric">
              <Activity size={20} />
              <span>平均价值: ¥{valueStats.avgValue.toFixed(2)}</span>
            </div>
            <div className="metric">
              <Star size={20} />
              <span>高价值物品: {valueStats.highValueItems}</span>
            </div>
          </div>
        </div>

        {/* 品牌分析 */}
        <div className="stats-card brand-analysis">
          <h3>品牌分析 (Top 5)</h3>
          <div className="brand-list">
            {brandStats.map(brand => (
              <div key={brand.name} className="brand-item">
                <span className="brand-name">{brand.name}</span>
                <span className="brand-count">{brand.count}件</span>
                <span className="brand-value">¥{brand.avgValue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats; 