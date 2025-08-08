import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ExpiryTrendChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#333' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              fontSize: '14px'
            }}>
              {entry.name}: {entry.value} 个
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="expired" 
            stroke="#CB4154" 
            strokeWidth={3}
            name="已过期"
            dot={{ fill: '#CB4154', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#CB4154', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="expiring" 
            stroke="#E89F65" 
            strokeWidth={3}
            name="即将过期"
            dot={{ fill: '#E89F65', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#E89F65', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#8A9A5B" 
            strokeWidth={3}
            name="总计"
            dot={{ fill: '#8A9A5B', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#8A9A5B', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpiryTrendChart; 