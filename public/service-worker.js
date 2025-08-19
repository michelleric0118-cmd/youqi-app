// 有期 - Service Worker v3.0
// 支持离线缓存、推送通知、后台同步和PWA功能
// 优化版本：解决离线数据访问和通知点击跳转问题

const CACHE_NAME = 'youqi-v3.0.0';
const STATIC_CACHE = 'youqi-static-v3.0.0';
const DYNAMIC_CACHE = 'youqi-dynamic-v3.0.0';
const API_CACHE = 'youqi-api-v3.0.0';

// 需要缓存的静态资源
const STATIC_URLS = [
  '/',
  '/static/js/main.bundle.js',
  '/static/css/main.css',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// 需要缓存的动态页面
const DYNAMIC_URLS = [
  '/expiring',
  '/items',
  '/add-item',
  '/settings',
  '/statistics'
];

// 需要缓存的API端点（用于离线数据访问）
const API_ENDPOINTS = [
  '/api/items',
  '/api/categories',
  '/api/user/settings'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing v3.0...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE)
        .then((cache) => {
          console.log('Service Worker: Caching static resources');
          return cache.addAll(STATIC_URLS);
        }),
      
      // 预缓存动态页面
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          console.log('Service Worker: Caching dynamic pages');
          return cache.addAll(DYNAMIC_URLS);
        }),
      
      // 创建API缓存
      caches.open(API_CACHE)
        .then((cache) => {
          console.log('Service Worker: API cache created');
          return cache;
        })
    ]).then(() => {
      console.log('Service Worker: Installation completed');
      // 立即激活新的Service Worker
      return self.skipWaiting();
    })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating v3.0...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation completed');
      // 立即控制所有页面
      return self.clients.claim();
    })
  );
});

// 拦截网络请求 - 智能缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非GET请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过非HTTP(S)请求
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // 跳过第三方资源
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // 处理不同类型的请求
  if (isAPIRequest(url)) {
    // API请求：使用StaleWhileRevalidate策略
    event.respondWith(handleAPIRequest(request));
  } else if (isPageRequest(request)) {
    // 页面请求：使用CacheFirst策略，回退到网络
    event.respondWith(handlePageRequest(request));
  } else if (isStaticRequest(url)) {
    // 静态资源：使用CacheFirst策略
    event.respondWith(handleStaticRequest(request));
  } else {
    // 其他请求：使用NetworkFirst策略
    event.respondWith(handleOtherRequest(request));
  }
});

// 判断是否为API请求
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.pathname.includes('leancloud') ||
         url.pathname.includes('firebase');
}

// 判断是否为页面请求
function isPageRequest(request) {
  // 安全检查：确保request.url存在
  if (!request || !request.url) {
    console.log('Service Worker: Invalid request object:', request);
    return false;
  }
  
  return request.destination === 'document' || 
         DYNAMIC_URLS.some(pageUrl => request.url.pathname && request.url.pathname.startsWith(pageUrl));
}

// 判断是否为静态资源请求
function isStaticRequest(url) {
  // 安全检查：确保url和pathname存在
  if (!url || !url.pathname) {
    console.log('Service Worker: Invalid URL object:', url);
    return false;
  }
  
  return STATIC_URLS.some(staticUrl => url.pathname.startsWith(staticUrl)) ||
         url.pathname.includes('.js') ||
         url.pathname.includes('.css') ||
         url.pathname.includes('.png') ||
         url.pathname.includes('.ico');
}

// 处理API请求 - StaleWhileRevalidate策略
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // 先尝试从缓存返回
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Service Worker: API serving from cache:', request.url);
      
      // 同时更新缓存（不阻塞响应）
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
            console.log('Service Worker: API cache updated:', request.url);
          }
        })
        .catch((error) => {
          console.log('Service Worker: API cache update failed:', request.url, error);
        });
      
      return cachedResponse;
    }
    
    // 缓存中没有，从网络获取
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: API cached new response:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: API request failed, trying cache:', request.url, error);
    
    // 网络失败，尝试从缓存返回
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Service Worker: API serving stale cache:', request.url);
      return cachedResponse;
    }
    
    // 缓存也没有，返回错误响应
    return new Response('API unavailable offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// 处理页面请求 - CacheFirst策略
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // 先尝试从缓存返回
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Page serving from cache:', request.url);
      return cachedResponse;
    }
    
    // 缓存中没有，从网络获取
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: Page cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Page request failed:', request.url, error);
    
    // 网络失败，返回离线页面
    const offlineResponse = await cache.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // 离线页面也没有，返回默认响应
    return new Response('Page unavailable offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// 处理静态资源请求 - CacheFirst策略
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    // 先尝试从缓存返回
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Static resource from cache:', request.url);
      return cachedResponse;
    }
    
    // 缓存中没有，从网络获取
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: Static resource cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Static resource failed:', request.url, error);
    
    // 网络失败，返回默认响应
    return new Response('Resource unavailable', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// 处理其他请求 - NetworkFirst策略
async function handleOtherRequest(request) {
  try {
    // 先尝试从网络获取
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      console.log('Service Worker: Other request from network:', request.url);
      return networkResponse;
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Other request failed:', request.url, error);
    
    // 网络失败，返回错误响应
    return new Response('Request failed', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// 推送事件 - 处理推送通知
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received:', event);
  
  let notificationData = {
    title: '有期提醒',
    body: '您有物品即将过期',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'youqi-reminder',
    requireInteraction: true,
    data: {
      url: '/expiring',
      timestamp: Date.now(),
      type: 'expiry-reminder'
    },
    actions: [
      {
        action: 'view',
        title: '查看详情',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: '稍后提醒',
        icon: '/logo192.png'
      }
    ]
  };

  // 如果有推送数据，使用推送数据
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
        data: {
          ...notificationData.data,
          ...pushData.data
        }
      };
      console.log('Service Worker: Using push data:', pushData);
    } catch (error) {
      console.log('Service Worker: Push data parsing failed, using default');
    }
  }

  // 显示通知
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
      .then(() => {
        console.log('Service Worker: Notification displayed successfully');
      })
      .catch((error) => {
        console.error('Service Worker: Failed to display notification:', error);
      })
  );
});

// 通知点击事件 - 优化版本
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event);
  
  event.notification.close();

  // 获取通知数据
  const notificationData = event.notification.data || {};
  const url = notificationData.url || '/';
  const itemId = notificationData.itemId;
  const action = event.action;

  // 处理通知操作
  if (action === 'view') {
    // 查看详情 - 直接跳转到对应页面
    if (itemId) {
      // 如果有物品ID，跳转到编辑页面
      openOrFocusApp(`/edit-item/${itemId}`);
    } else {
      // 否则跳转到过期物品列表
      openOrFocusApp('/expiring');
    }
  } else if (action === 'dismiss') {
    // 稍后提醒
    scheduleDelayedReminder(notificationData);
  } else {
    // 默认点击行为 - 智能跳转
    if (itemId) {
      openOrFocusApp(`/edit-item/${itemId}`);
    } else if (notificationData.type === 'expiry-reminder') {
      openOrFocusApp('/expiring');
    } else {
      openOrFocusApp(url);
    }
  }
});

// 通知关闭事件
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed:', event);
  
  // 可以在这里记录用户行为或发送分析数据
  const notificationData = event.notification.data || {};
  
  // 发送分析数据（如果需要）
  if (notificationData.analytics) {
    console.log('Service Worker: User dismissed notification:', notificationData);
    // 这里可以发送用户行为数据到分析服务
  }
});

// 后台同步事件
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event:', event);
  
  if (event.tag === 'check-expiring-items') {
    event.waitUntil(checkExpiringItems());
  } else if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

// 消息事件 - 处理来自主线程的消息
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'check-expiring-items') {
    // 立即检查过期物品
    checkExpiringItems();
  }
  
  if (event.data && event.data.type === 'update-cache') {
    // 更新缓存
    updateCache();
  }
});

// 辅助函数：打开或聚焦应用
function openOrFocusApp(url) {
  clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      // 查找已打开的应用窗口
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (url !== '/') {
            client.navigate(url);
          }
          return;
        }
      }
      
      // 如果没有找到已打开的窗口，打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    });
}

// 辅助函数：安排延迟提醒
function scheduleDelayedReminder(notificationData) {
  // 延迟1小时后再次提醒
  const delay = 60 * 60 * 1000; // 1小时
  
  setTimeout(() => {
    // 重新发送通知
    self.registration.showNotification(
      notificationData.title || '有期提醒',
      {
        ...notificationData,
        tag: `delayed-${notificationData.tag || 'reminder'}`,
        body: '延迟提醒：' + (notificationData.body || '您有物品即将过期')
      }
    );
  }, delay);
}

// 辅助函数：检查过期物品
async function checkExpiringItems() {
  try {
    console.log('Service Worker: Background sync: Checking expiring items...');
    
    // 这里可以执行后台检查逻辑
    // 例如：检查本地存储的物品数据，发送推送通知等
    
    // 模拟后台检查
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Service Worker: Background sync: Expiring items check completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

// 辅助函数：更新缓存
async function updateCache() {
  try {
    console.log('Service Worker: Updating cache...');
    
    // 清理旧缓存
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
        await caches.delete(cacheName);
      }
    }
    
    console.log('Service Worker: Cache update completed');
  } catch (error) {
    console.error('Service Worker: Cache update failed:', error);
  }
}

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error:', event.error);
});

// 未处理的Promise拒绝
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled rejection:', event.reason);
});