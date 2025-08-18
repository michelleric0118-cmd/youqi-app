import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Plus, Clock } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/items', label: '物品管理', icon: Package },
    { path: '/add', label: '添加物品', icon: Plus },
    { path: '/expiring', label: '过期管理', icon: Clock }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <h1 className="navbar-title">有期</h1>
        <p className="navbar-subtitle">家庭物品管理系统</p>
      </div>
      <div className="navbar-tabs">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`navbar-tab ${location.pathname === path ? 'active' : ''}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Icon size={20} />
              <span>{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar; 