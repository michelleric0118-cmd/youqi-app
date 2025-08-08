const CACHE_NAME = 'youqi-cache-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  OFFLINE_URL
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // 缓存静态资源
      await cache.addAll(STATIC_RESOURCES);
      // 强制激活
      await self.skipWaiting();
    })()
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 清理旧缓存
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      // 接管所有客户端
      await self.clients.claim();
    })()
  );
});

// 处理fetch请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        // 尝试从网络获取资源
        const networkResponse = await fetch(event.request);
        
        // 如果是GET请求，缓存响应
        if (event.request.method === 'GET') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // 网络请求失败，尝试从缓存获取
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 如果是页面请求，返回离线页面
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          return cache.match(OFFLINE_URL);
        }

        // 其他情况返回错误响应
        return new Response('Network error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    })()
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('有期提醒', options)
  );
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 数据同步函数
async function syncData() {
  const db = await openDB();
  const pendingData = await db.getAll('sync-store');
  
  for (const data of pendingData) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      await db.delete('sync-store', data.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// 打开IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('youqi-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync-store')) {
        db.createObjectStore('sync-store', { keyPath: 'id' });
      }
    };
  });
}