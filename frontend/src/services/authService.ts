// frontend/src/services/authService.ts
// import type { UserCredentials, UserRegistrationInfo, User, TokenResponse } from '@/schemas';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  // 修正 Content-Type 設定邏輯
  // 只有在沒有預設 Content-Type，且 body 不是 FormData 或 URLSearchParams 時，
  // 才將 Content-Type 設為 application/json
  if (
    !headers.has('Content-Type') &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams)
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(response.statusText || `請求失敗，狀態碼: ${response.status}`);
    }
    throw new Error(errorData?.detail || `請求失敗，狀態碼: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export async function loginUser(credentials: /* UserCredentials */ any): Promise</*TokenResponse*/ any> {
  return request<any>(`${API_BASE_URL}/auth/login/access-token`, {
    method: 'POST',
    body: new URLSearchParams(credentials as any),
    // 此處不需要明確設定 headers 中的 Content-Type，
    // 因為 new URLSearchParams(...) 配合 fetch API 時，
    // 瀏覽器會自動設定為 'application/x-www-form-urlencoded'
    // 上面修正的 request 函式也不會錯誤地覆蓋它。
  });
}

export async function registerUser(userInfo: /* UserRegistrationInfo */ any): Promise</*User*/ any> {
  return request</*User*/ any>(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(userInfo), // 註冊端點預期是 JSON
  });
}

export async function getCurrentUser(/* token: string */): Promise</*User*/ any> {
  return request</*User*/ any>(`${API_BASE_URL}/auth/users/me`, {
    method: 'GET',
  });
}

export async function logoutUser(): Promise<void> {
  console.log('authService: 執行登出請求到後端');
   try {
        // 後端 /logout 端點預期是 POST，並且會從 cookie 讀取 refresh token
        // 前端不需要傳遞 body 或特定的 token
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: { // 確保 Authorization header (如果有的話) 被傳送
                 ...(localStorage.getItem('accessToken') ? { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } : {})
            }
        });
        console.log('authService: 後端登出請求已發送');
    } catch (error) {
        // 這裡的錯誤通常是網路錯誤，因為後端登出成功通常返回 200 OK (帶有清除 cookie 的 header) 或 204 No Content
        // 即使這裡出錯，authStore 中的 finally 區塊仍會清除前端 token
        console.error("登出請求到後端失敗:", error);
        // 可以選擇是否向上拋出錯誤，但對於登出操作，即使後端呼叫失敗，前端清理通常也應繼續
    }
}

export async function refreshToken(): Promise</* TokenResponse */ any> {
  return request</* TokenResponse */ any>(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    // 不需要 body，因為 refresh token 在 cookie 中
  });
}