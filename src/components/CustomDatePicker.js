import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, endOfMonth, startOfMonth } from 'date-fns';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDatePicker = ({ 
  isOpen, 
  onClose, 
  value, 
  onChange, 
  placeholder = "选择日期" 
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const inputRef = useRef(null);

  // 初始化输入值
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          // 确保日期格式化为 YYYY.MM.DD 格式
          const formattedDate = format(date, 'yyyy.MM.dd');
          setCurrentInput(formattedDate);
          setCurrentDate(date);
        }
      } catch (error) {
        console.error('日期解析错误:', error);
        setCurrentInput('');
      }
    } else {
      setCurrentInput('');
    }
  }, [value]);

  // 快捷选项数据
  const getQuickOptions = () => {
    const today = new Date();
    const currentMonth = endOfMonth(today);
    const nextMonth = endOfMonth(addMonths(today, 1));
    
    return [
      { label: '今天', date: today, action: 'set' },
      { label: '本月', date: currentMonth, action: 'set' },
      { label: '下个月', date: nextMonth, action: 'set' },
      { label: '2025年', date: new Date(2025, 0, 1), action: 'year' },
      { label: '2026年', date: new Date(2026, 0, 1), action: 'year' },
      { label: '2027年', date: new Date(2027, 0, 1), action: 'year' },
      { label: '2028年', date: new Date(2028, 0, 1), action: 'year' },
    ];
  };

  // 检查快捷选项是否应该高亮
  const isQuickOptionActive = (option) => {
    if (!currentInput) return false;
    
    try {
      if (option.action === 'set') {
        // 检查是否与当前输入匹配
        const optionFormatted = format(option.date, 'yyyy.MM.dd');
        return currentInput === optionFormatted;
      } else if (option.action === 'year') {
        // 检查年份是否匹配
        const currentYear = currentInput.split('.')[0];
        return currentYear === option.date.getFullYear().toString();
      }
    } catch (error) {
      return false;
    }
    
    return false;
  };

  // 处理快捷选项点击
  const handleQuickOption = (option) => {
    if (option.action === 'set') {
      // 直接设置完整日期
      const formattedDate = format(option.date, 'yyyy.MM.dd');
      setCurrentInput(formattedDate);
      onChange(format(option.date, 'yyyy-MM-dd'));
      onClose();
    } else if (option.action === 'year') {
      // 设置年份，光标跳转到月份
      const currentYear = option.date.getFullYear();
      const currentMonth = currentInput.split('.')[1] || '';
      const currentDay = currentInput.split('.')[2] || '';
      
      let newInput = currentYear.toString();
      if (currentMonth) {
        newInput += '.' + currentMonth;
        if (currentDay) {
          newInput += '.' + currentDay;
        }
      }
      
      setCurrentInput(newInput);
      
      // 光标跳转到月份位置
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(5, 7);
        }
      }, 100);
    }
  };

  // 处理数字输入
  const handleNumberInput = (number) => {
    let newInput = currentInput + number;
    
    // 使用格式化函数确保正确的格式
    const formattedInput = formatDateInput(newInput);
    
    // 限制总长度（YYYY.MM.DD = 10个字符）
    if (formattedInput.length <= 10) {
      setCurrentInput(formattedInput);
    }
  };

  // 处理删除
  const handleDelete = () => {
    if (currentInput.endsWith('.')) {
      setCurrentInput(currentInput.slice(0, -1));
    } else {
      setCurrentInput(currentInput.slice(0, -1));
    }
  };

  // 智能日期验证
  const validateDate = (input) => {
    if (input.length !== 10) return false;
    
    try {
      const parts = input.split('.');
      if (parts.length !== 3) return false;
      
      const [year, month, day] = parts;
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      
      // 基本范围检查
      if (yearNum < 1900 || yearNum > 2100) return false;
      if (monthNum < 1 || monthNum > 12) return false;
      if (dayNum < 1 || dayNum > 31) return false;
      
      // 创建日期对象验证
      const date = new Date(yearNum, monthNum - 1, dayNum);
      if (date.getFullYear() !== yearNum || 
          date.getMonth() !== monthNum - 1 || 
          date.getDate() !== dayNum) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  // 格式化日期输入，确保正确的格式
  const formatDateInput = (input) => {
    // 移除所有非数字字符
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 6) {
      return numbers.slice(0, 4) + '.' + numbers.slice(4);
    } else {
      return numbers.slice(0, 4) + '.' + numbers.slice(4, 6) + '.' + numbers.slice(6, 8);
    }
  };

  // 获取输入状态样式
  const getInputStatusStyle = () => {
    if (!currentInput) return {};
    
    if (currentInput.length === 10) {
      if (validateDate(currentInput)) {
        return { borderColor: '#10b981', background: '#f0fdf4' }; // 成功状态
      } else {
        return { borderColor: '#ef4444', background: '#fef2f2' }; // 错误状态
      }
    }
    
    return {}; // 默认状态
  };

  // 显示错误提示
  const showErrorToast = (message) => {
    // 创建临时错误提示元素
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      toast.style.cssText += `
        @keyframes slideOut {
          from { transform: translateX(-50%) translateY(0); opacity: 1; }
          to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        }
      `;
      setTimeout(() => {
        document.body.removeChild(toast);
        document.head.removeChild(style);
      }, 300);
    }, 3000);
  };

  // 处理确认
  const handleConfirm = () => {
    if (currentInput.length === 10) {
      try {
        // 解析日期格式 YYYY.MM.DD
        const [year, month, day] = currentInput.split('.');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        if (!isNaN(date.getTime())) {
          onChange(format(date, 'yyyy-MM-dd'));
          onClose();
        } else {
          // 显示错误提示
          showErrorToast('请输入有效的日期');
        }
      } catch (error) {
        showErrorToast('日期格式错误，请重新输入');
      }
    } else {
      showErrorToast('请输入完整的日期');
    }
  };

  // 快捷选项按钮
  const QuickOptionButton = ({ option, isActive }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleQuickOption(option)}
      className={`quick-option-btn ${isActive ? 'active' : ''}`}
    >
      {option.label}
    </motion.button>
  );

  // 数字键盘按钮
  const NumberButton = ({ number, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="number-btn"
    >
      {number}
    </motion.button>
  );

  // 日历视图组件
  const CalendarView = () => {
    const [selectedMonth, setSelectedMonth] = useState(currentDate);
    
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // 添加前一个月的天数
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const prevDate = new Date(year, month, -i);
        days.push({ date: prevDate, isCurrentMonth: false });
      }
      
      // 添加当前月的天数
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month, i);
        days.push({ date: currentDate, isCurrentMonth: true });
      }
      
      // 添加下一个月的天数
      const remainingDays = 42 - days.length; // 6行7列 = 42
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(year, month + 1, i);
        days.push({ date: nextDate, isCurrentMonth: false });
      }
      
      return days;
    };

    const handleDateSelect = (date) => {
      const formattedDate = format(date, 'yyyy.MM.dd');
      setCurrentInput(formattedDate);
      setShowCalendar(false);
    };

    const goToPreviousMonth = () => {
      setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
      setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const days = getDaysInMonth(selectedMonth);
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
      <motion.div
        className="calendar-view"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 日历头部 */}
        <div className="calendar-header">
          <button onClick={goToPreviousMonth} className="month-nav-btn">
            <ChevronLeft size={16} />
          </button>
          <h4>{format(selectedMonth, 'yyyy年M月')}</h4>
          <button onClick={goToNextMonth} className="month-nav-btn">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* 星期标题 */}
        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="calendar-grid">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(day.date)}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                format(day.date, 'yyyy.MM.dd') === currentInput ? 'selected' : ''
              }`}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>

        {/* 返回按钮 */}
        <div className="calendar-actions">
          <button
            onClick={() => setShowCalendar(false)}
            className="back-to-keypad-btn"
          >
            返回数字键盘
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 样式 */}
          <style>
            {`
              .custom-date-picker-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: flex-end;
                justify-content: center;
                z-index: 1000;
              }
              
              .custom-date-picker {
                background: white;
                border-radius: 20px 20px 0 0;
                width: 100%;
                max-width: 400px;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
              }
              
              .picker-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #f3f4f6;
                background: #fafafa;
              }
              
              .picker-header h3 {
                margin: 0;
                color: #374151;
                font-size: 18px;
                font-weight: 600;
              }
              
              .picker-header .close-btn {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s ease;
              }
              
              .picker-header .close-btn:hover {
                background: #e5e7eb;
                color: #374151;
              }
              
              .quick-options {
                padding: 20px;
                border-bottom: 1px solid #f3f4f6;
              }
              
              .quick-options-scroll {
                display: flex;
                gap: 12px;
                overflow-x: auto;
                padding-bottom: 8px;
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              
              .quick-options-scroll::-webkit-scrollbar {
                display: none;
              }
              
              .quick-option-btn {
                background: #f3f4f6;
                border: none;
                padding: 10px 16px;
                border-radius: 20px;
                color: #374151;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s ease;
                flex-shrink: 0;
              }
              
              .quick-option-btn:hover {
                background: #e5e7eb;
                transform: translateY(-1px);
              }
              
              .quick-option-btn.active {
                background: var(--sage-green);
                color: white;
              }
              
              .calendar-toggle-btn {
                background: #e5e7eb;
                border: none;
                padding: 10px;
                border-radius: 50%;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .calendar-toggle-btn:hover {
                background: #d1d5db;
                color: #374151;
              }
              
              .input-display {
                padding: 20px;
                border-bottom: 1px solid #f3f4f6;
              }
              
              .date-input {
                width: 100%;
                padding: 16px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 18px;
                text-align: center;
                font-family: 'Courier New', monospace;
                letter-spacing: 2px;
                background: #fafafa;
                color: #374151;
                outline: none;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
              }
              
              .date-input:focus {
                border-color: var(--sage-green);
                background: white;
              }
              
              .input-status {
                margin-top: 8px;
                text-align: center;
                font-size: 12px;
                font-weight: 500;
              }
              
              .status-success {
                color: #10b981;
              }
              
              .status-error {
                color: #ef4444;
              }
              
              .number-keypad {
                padding: 20px;
                background: #fafafa;
              }
              
              .keypad-row {
                display: flex;
                gap: 12px;
                margin-bottom: 12px;
              }
              
              .keypad-row:last-child {
                margin-bottom: 0;
              }
              
              .number-btn {
                flex: 1;
                background: white;
                border: 1px solid #e5e7eb;
                padding: 20px 16px;
                border-radius: 12px;
                color: #374151;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
              }
              
              .number-btn:hover {
                background: #f9fafb;
                border-color: var(--sage-green);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              
              .number-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
              }
              
              .confirm-btn {
                flex: 1;
                background: var(--sage-green);
                border: none;
                padding: 20px 16px;
                border-radius: 12px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              
              .confirm-btn:hover:not(:disabled) {
                background: #7a8a4a;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
              }
              
              .confirm-btn:disabled {
                background: #9ca3af;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
              }
              
              /* 响应式设计 */
              @media (max-width: 480px) {
                .custom-date-picker {
                  max-width: 100%;
                  border-radius: 20px 20px 0 0;
                }
                
                .number-btn {
                  padding: 18px 12px;
                  font-size: 16px;
                }
                
                .quick-option-btn {
                  padding: 8px 14px;
                  font-size: 13px;
                }
              }
              
              /* 日历视图样式 */
              .calendar-view {
                padding: 20px;
                border-top: 1px solid #f3f4f6;
                background: white;
              }
              
              .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
              }
              
              .calendar-header h4 {
                margin: 0;
                color: #374151;
                font-size: 16px;
                font-weight: 600;
              }
              
              .month-nav-btn {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s ease;
              }
              
              .month-nav-btn:hover {
                background: #f3f4f6;
                color: #374151;
              }
              
              .weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 8px;
                margin-bottom: 16px;
              }
              
              .weekday {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                padding: 8px 4px;
              }
              
              .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 8px;
                margin-bottom: 20px;
              }
              
              .calendar-day {
                background: white;
                border: 1px solid #e5e7eb;
                padding: 12px 8px;
                border-radius: 8px;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
              }
              
              .calendar-day:hover {
                background: #f9fafb;
                border-color: var(--sage-green);
              }
              
              .calendar-day.other-month {
                color: #9ca3af;
                background: #f9fafb;
              }
              
              .calendar-day.selected {
                background: var(--sage-green);
                color: white;
                border-color: var(--sage-green);
              }
              
              .calendar-actions {
                text-align: center;
              }
              
              .back-to-keypad-btn {
                background: #f3f4f6;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                color: #374151;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
              }
              
              .back-to-keypad-btn:hover {
                background: #e5e7eb;
                color: #374151;
              }
              
              /* 触摸反馈优化 */
              .number-btn:active,
              .quick-option-btn:active,
              .calendar-day:active {
                transform: scale(0.95);
                transition: transform 0.1s ease;
              }
              
              /* 错误提示样式 */
              .error-toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #ef4444;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 1001;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease-out;
              }
              
              @keyframes slideIn {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
              }
              
              @keyframes slideOut {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
              }
              
              /* 无障碍访问支持 */
              .number-btn:focus,
              .quick-option-btn:focus,
              .calendar-day:focus,
              .month-nav-btn:focus {
                outline: 2px solid var(--sage-green);
                outline-offset: 2px;
              }
              
              /* 高对比度模式支持 */
              @media (prefers-contrast: high) {
                .custom-date-picker {
                  border: 2px solid #000;
                }
                
                .number-btn {
                  border: 2px solid #000;
                }
                
                .quick-option-btn {
                  border: 2px solid #000;
                }
              }
              
              /* 减少动画模式支持 */
              @media (prefers-reduced-motion: reduce) {
                .custom-date-picker,
                .number-btn,
                .quick-option-btn,
                .calendar-day {
                  animation: none;
                  transition: none;
                }
              }
            `}
          </style>

          <motion.div
            className="custom-date-picker-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="custom-date-picker"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="picker-header">
                <h3>选择日期</h3>
                <button onClick={onClose} className="close-btn">
                  <X size={20} />
                </button>
              </div>

              {/* 快捷选项栏 */}
              <div className="quick-options">
                <div className="quick-options-scroll">
                  {getQuickOptions().map((option, index) => (
                    <QuickOptionButton
                      key={index}
                      option={option}
                      isActive={isQuickOptionActive(option)}
                    />
                  ))}
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="calendar-toggle-btn"
                  >
                    <Calendar size={16} />
                  </button>
                </div>
              </div>

              {/* 输入显示区 */}
              <div className="input-display">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="YYYY.MM.DD"
                  className="date-input"
                  readOnly
                  style={getInputStatusStyle()}
                />
                {currentInput.length === 10 && (
                  <div className="input-status">
                    {validateDate(currentInput) ? (
                      <span className="status-success">✓ 日期有效</span>
                    ) : (
                      <span className="status-error">✗ 日期无效</span>
                    )}
                  </div>
                )}
              </div>

              {/* 数字键盘区 */}
              <div className="number-keypad">
                <div className="keypad-row">
                  <NumberButton number="1" onClick={() => handleNumberInput('1')} />
                  <NumberButton number="2" onClick={() => handleNumberInput('2')} />
                  <NumberButton number="3" onClick={() => handleNumberInput('3')} />
                </div>
                <div className="keypad-row">
                  <NumberButton number="4" onClick={() => handleNumberInput('4')} />
                  <NumberButton number="5" onClick={() => handleNumberInput('5')} />
                  <NumberButton number="6" onClick={() => handleNumberInput('6')} />
                </div>
                <div className="keypad-row">
                  <NumberButton number="7" onClick={() => handleNumberInput('7')} />
                  <NumberButton number="8" onClick={() => handleNumberInput('8')} />
                  <NumberButton number="9" onClick={() => handleNumberInput('9')} />
                </div>
                <div className="keypad-row">
                  <NumberButton number="删除" onClick={handleDelete} />
                  <NumberButton number="0" onClick={() => handleNumberInput('0')} />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirm}
                    className="confirm-btn"
                    disabled={currentInput.length !== 10}
                  >
                    确认
                  </motion.button>
                </div>
              </div>

              {/* 日历视图 */}
              {showCalendar && <CalendarView />}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomDatePicker; 