/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router/auto';
import { setupLayouts } from 'virtual:generated-layouts';
import { routes } from 'vue-router/auto-routes';
import { useAuthStore } from '@/stores/auth'; // 匯入 Auth Store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});

// 全域前置守衛
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: Function) => {
  const authStore = useAuthStore();

  // 嘗試從 localStorage 初始化 accessToken (如果 store 尚未初始化或頁面刷新)
  // Pinia store 的 state 初始化時已經做了這個，但為了確保時序，可以在這裡再檢查一次
  if (!authStore.accessToken && localStorage.getItem('accessToken')) {
    authStore.accessToken = localStorage.getItem('accessToken');
  }

  // 如果使用者資訊尚未載入且有 token，嘗試獲取使用者資訊
  // 這是為了處理直接進入受保護頁面或刷新頁面的情況
  if (authStore.accessToken && !authStore.user) {
    // 只有在 store 中沒有 user 資訊時才嘗試獲取，避免重複呼叫
    // 如果 fetchCurrentUser 失敗 (例如 token 過期)，它內部會清除 token 和 user
    await authStore.fetchCurrentUser();
  }

  const publicPages = ['/login', '/register']; // 定義公開頁面路徑
  const authRequired = !publicPages.includes(to.path); // 判斷目標路由是否需要驗證

  if (authRequired && !authStore.isAuthenticated) {
    // 如果路由需要驗證但使用者未登入，則重定向到登入頁面
    // 並將目標路由作為查詢參數傳遞，以便登入後可以跳轉回來
    console.log('路由守衛：未登入，目標路徑需要驗證，重定向到 /login');
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  if (!authRequired && authStore.isAuthenticated) {
    // 如果使用者已登入，但嘗試存取登入/註冊等公開頁面，則重定向到首頁
    console.log('路由守衛：已登入，嘗試存取公開頁面，重定向到 /');
    return next({ path: '/' });
  }

  // 其他情況，允許導航
  console.log(`路由守衛：允許導航到 ${to.path}`);
  next();
});


// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err);
    } else {
      console.log('Reloading page to fix dynamic import error');
      localStorage.setItem('vuetify:dynamic-reload', 'true');
      location.assign(to.fullPath);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload');
});

export default router;