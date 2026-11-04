/**
 * Service Worker cho ExpenseFlow PWA
 * Cung cấp khả năng hoạt động offline, mở App tức thì và hỗ trợ cài đặt Standalone App.
 */

const CACHE_NAME = "expenseflow-pwa-v12";

// Danh sách tài nguyên tĩnh cần cache sẵn để App tải tức thì
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/favicon.png"
];

// 1. Cài đặt Service Worker (Install Event)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Đang nạp trước tài nguyên tĩnh vào Cache...");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Kích hoạt và dọn dẹp các bản Cache cũ (Activate Event)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Xóa Cache phiên bản cũ:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Xử lý Request tài nguyên (Fetch Event)
self.addEventListener("fetch", (event) => {
  // Bỏ qua các request không phải GET
  if (event.request.method !== "GET") return;

  // Chiến lược: Network-first với Cache Fallback cho HTML/JS/CSS tĩnh
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Khi mất mạng, trả về từ Cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
