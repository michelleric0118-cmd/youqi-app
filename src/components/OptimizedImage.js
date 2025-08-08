import React, { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  quality = 'auto',
  format = 'auto',
  fit = 'cover',
  placeholder = 'blur',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);
  const observerRef = useRef(null);

  // 构建优化的图片URL
  const getOptimizedUrl = (url) => {
    if (!url) return '';
    
    // 如果已经是Cloudflare优化的URL，直接返回
    if (url.includes('imagedelivery.net')) return url;
    
    // 添加Cloudflare图片优化参数
    const params = new URLSearchParams({
      quality: quality,
      format: format,
      fit: fit,
      width: width || 'auto',
      height: height || 'auto'
    });

    return `${url}?${params.toString()}`;
  };

  // 处理图片加载完成
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // 处理图片加载错误
  const handleError = (e) => {
    setError(e);
    if (onError) onError(e);
  };

  // 设置懒加载
  useEffect(() => {
    if (!imageRef.current || loading !== 'lazy') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observerRef.current.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(imageRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading]);

  // 生成占位符样式
  const placeholderStyles = {
    blur: {
      filter: isLoaded ? 'none' : 'blur(10px)',
      transition: 'filter 0.3s ease-in-out'
    },
    none: {}
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || 'auto',
        height: height || 'auto'
      }}
    >
      <img
        ref={imageRef}
        src={loading === 'lazy' ? '' : getOptimizedUrl(src)}
        data-src={loading === 'lazy' ? getOptimizedUrl(src) : undefined}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full 
          h-full 
          object-${fit}
          ${error ? 'opacity-0' : 'opacity-100'}
          transition-opacity
          duration-300
        `}
        style={placeholderStyles[placeholder]}
        {...props}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">图片加载失败</span>
        </div>
      )}

      {!isLoaded && placeholder === 'blur' && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;