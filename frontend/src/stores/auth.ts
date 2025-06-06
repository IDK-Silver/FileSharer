import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authService from '@/services/authService';

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  role: 'admin' | 'manager' | 'user';
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const loading = ref(false);
  const loginLoading = ref(false);
  const registerLoading = ref(false);
  const fetchUserLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const userRole = computed(() => user.value?.role);

  // Actions
  async function login(credentials: any): Promise<boolean> {
    loginLoading.value = true;
    error.value = null;
    try {
      const response: TokenResponse = await authService.loginUser(credentials);
      accessToken.value = response.access_token;
      localStorage.setItem('accessToken', response.access_token);
      await fetchCurrentUser();
      return true;
    } catch (e: any) {
      error.value = e.message || '登入失敗';
      handleAuthError();
      return false;
    } finally {
      loginLoading.value = false;
    }
  }

  async function register(userInfo: any): Promise<boolean> {
    registerLoading.value = true;
    error.value = null;
    try {
      await authService.registerUser(userInfo);
      return true;
    } catch (e: any) {
      error.value = e.message || '註冊失敗';
      return false;
    } finally {
      registerLoading.value = false;
    }
  }

  async function fetchCurrentUser(): Promise<User | null> {
    if (!accessToken.value) {
      user.value = null;
      return null;
    }
    fetchUserLoading.value = true;
    error.value = null;
    try {
      const currentUserData: User = await authService.getCurrentUser();
      user.value = currentUserData;
      return currentUserData;
    } catch (e: any) {
      error.value = e.message || '無法獲取使用者資訊';
      handleAuthError();
      return null;
    } finally {
      fetchUserLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      // 步驟 1: 通知後端登出 (使其 Refresh Token Cookie 失效)
      if (accessToken.value) { // 確保在有 token 的情況下才嘗試呼叫後端登出
        await authService.logoutUser(); // 呼叫 service 中的 logoutUser 函式
      }
    } catch(e: any) {
        console.error("後端登出請求失敗(可能是網路問題或 cookie 已失效):", e.message);
        // 即使後端登出失敗，前端仍應繼續清除狀態
    } finally {
        // 步驟 2: 清除前端的驗證狀態
        user.value = null;
        accessToken.value = null;
        localStorage.removeItem('accessToken'); // 從 localStorage 清除 accessToken
        loading.value = false;
    }
  }

  function handleAuthError() {
    user.value = null;
    accessToken.value = null;
    localStorage.removeItem('accessToken');
  }

  async function updateMyUsername(newUsername: string) {
    // ... (省略 loading 和 error 處理)
    try {
      const updatedUser = await authService.updateUsername({
        username: newUsername,
      });
      // 更新本地 store 中的使用者資訊
      if (user.value) {
        user.value.username = updatedUser.username;
      }
    } catch (e: any) {
      console.error("更新使用者名稱失敗:", e);
      throw e; // 向上拋出錯誤讓 UI 處理
    }
  }

  async function updateMyPassword(passwordData: any) {
    // ... (省略 loading 和 error 處理)
    try {
      await authService.updatePassword(passwordData);
    } catch (e: any) {
      console.error("更新密碼失敗:", e);
      throw e;
    }
  }

  return {
    user,
    accessToken,
    loading,
    loginLoading,
    registerLoading,
    fetchUserLoading,
    error,
    isAuthenticated,
    isAdmin,
    userRole,
    login,
    register,
    logout,
    fetchCurrentUser,
    handleAuthError,
    updateMyPassword,
    updateMyUsername,
  };
});