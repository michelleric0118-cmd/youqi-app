import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { login, registerWithInvite } from '../../services/authService';
import toast from 'react-hot-toast';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除相关错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    }
    
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6位';
    }
    
    if (!isLogin) {
      // 邮箱改为选填，只在填写时验证格式
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = '邮箱格式不正确';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码不一致';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        // 登录
        await login({ username: formData.username, password: formData.password });
        toast.success('登录成功！');
        if (onLogin) onLogin();
        navigate('/');
      } else {
        // 注册需要邀请码
        const inviteCode = prompt('请输入邀请码（内测仅限20位）：');
        const result = await registerWithInvite({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          inviteCode
        });
        toast.success('注册成功！已自动登录');
        if (onLogin) onLogin();
        navigate('/');
      }
    } catch (err) {
      const msg = err.code === 'CAP_REACHED'
        ? '内测名额已满'
        : err.code === 'INVITE_INVALID'
          ? '邀请码无效或已被使用'
          : err.message || '操作失败，请重试';
      toast.error(msg);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '40px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            color: 'var(--sage-green)', 
            margin: '0 0 10px 0',
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            有期
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            {isLogin ? '欢迎回来' : '创建新账户'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 用户名 */}
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#666' 
              }} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="请输入用户名"
                style={{ paddingLeft: '40px' }}
                className={errors.username ? 'error' : ''}
              />
            </div>
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          {/* 邮箱（仅注册时显示） */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">邮箱（选填）</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="请输入邮箱（可选）"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          )}

          {/* 密码 */}
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#666' 
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="请输入密码"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* 确认密码（仅注册时显示） */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入密码"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          )}

          {/* 提交按钮 */}
          <div style={{ marginTop: '30px' }}>
            <button 
              type="submit" 
              className="btn" 
              style={{ 
                width: '100%',
                background: 'var(--sage-green)', 
                color: 'white',
                padding: '12px',
                fontSize: '1.1rem'
              }}
            >
              {isLogin ? '登录' : '注册'}
            </button>
          </div>
        </form>

        {/* 切换模式 */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sage-green)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            {isLogin ? '没有账户？立即注册' : '已有账户？立即登录'}
          </button>
        </div>


      </div>
    </div>
  );
};

export default Login; 