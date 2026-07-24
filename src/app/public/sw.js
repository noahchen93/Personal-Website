// Service Worker for Portfolio PWA
const CACHE_NAME = 'portfolio-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// 静态资源缓存列表
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 动态缓存的URL模式
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/rest\/v1\//,
  /^https:\/\/.*\.supabase\.co\/functions\/v1\//
];

// 图片缓存的URL模式
const IMAGE_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\//,
  /\.(jpg|jpeg|png|gif|webp|svg)$/i
];

// 不缓存的URL模式
const NO_CACHE_PATTERNS = [
  /\/admin/,
  /\/api\/auth/,
  /\?.*no-cache/
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('portfolio-') && !cacheName.includes('v1.0.0')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Failed to clean up old caches:', error);
      })
  );
});

// 获取事件 - 缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过不支持的请求
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // 跳过不缓存的URL
  if (NO_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    return;
  }
  
  // 处理不同类型的请求
  if (request.method === 'GET') {
    if (isStaticAsset(request.url)) {
      event.respondWith(handleStaticAsset(request));
    } else if (isImageRequest(request.url)) {
      event.respondWith(handleImageRequest(request));
    } else if (isDynamicRequest(request.url)) {
      event.respondWith(handleDynamicRequest(request));
    } else {
      event.respondWith(handleGenericRequest(request));
    }
  }
});

// 判断是否为静态资源
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.endsWith(asset)) ||
         url.includes('.js') || url.includes('.css') || url.includes('.woff');
}

// 判断是否为图片请求
function isImageRequest(url) {
  return IMAGE_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// 判断是否为动态请求
function isDynamicRequest(url) {
  return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// 处理静态资源 - Cache First 策略
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving static asset from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Fetching static asset:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Static asset request failed:', error);
    return new Response('Asset not available', { status: 503 });
  }
}

// 处理图片请求 - Cache First 策略，带有过期时间
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    // 检查缓存是否过期（24小时）
    if (cachedResponse) {
      const cachedDate = cachedResponse.headers.get('sw-cache-date');
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (cachedDate && (now - parseInt(cachedDate)) < maxAge) {
        console.log('[SW] Serving image from cache:', request.url);
        return cachedResponse;
      }
    }
    
    console.log('[SW] Fetching image:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      // 添加缓存时间戳
      const responseClone = response.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-date', Date.now().toString());
      
      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Image request failed:', error);
    // 返回缓存的版本（如果有）
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Image not available', { status: 503 });
  }
}

// 处理动态请求 - Network First 策略
async function handleDynamicRequest(request) {
  try {
    console.log('[SW] Fetching dynamic content:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Dynamic request failed, trying cache:', error);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving dynamic content from cache:', request.url);
      return cachedResponse;
    }
    
    // 返回离线页面或错误响应
    return new Response(
      JSON.stringify({ 
        error: 'Content not available offline',
        message: 'Please check your internet connection',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 处理通用请求 - Stale While Revalidate 策略
async function handleGenericRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // 并行处理：返回缓存内容，同时更新缓存
    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch((error) => {
      console.error('[SW] Network request failed:', error);
      return null;
    });
    
    // 如果有缓存，立即返回，否则等待网络请求
    if (cachedResponse) {
      console.log('[SW] Serving from cache while revalidating:', request.url);
      fetchPromise; // 不等待，让它在后台运行
      return cachedResponse;
    }
    
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    return new Response('Content not available', { status: 503 });
  } catch (error) {
    console.error('[SW] Generic request failed:', error);
    return new Response('Request failed', { status: 503 });
  }
}

// 后台同步 - 处理离线时的操作
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
  
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

// 同步分析数据
async function syncAnalytics() {
  try {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    if (events.length > 0) {
      console.log('[SW] Syncing analytics events:', events.length);
      // 这里可以发送到分析服务
      localStorage.setItem('analytics_events', '[]');
    }
  } catch (error) {
    console.error('[SW] Failed to sync analytics:', error);
  }
}

// 同步内容数据
async function syncContent() {
  try {
    console.log('[SW] Syncing content data...');
    // 这里可以预取最新的内容数据
  } catch (error) {
    console.error('[SW] Failed to sync content:', error);
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: 'You have new content available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'portfolio-update',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Updates'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.tag = data.tag || options.tag;
  }
  
  event.waitUntil(
    self.registration.showNotification('Portfolio Update', options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 消息处理 - 支持跳过等待
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('portfolio-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker script loaded successfully');