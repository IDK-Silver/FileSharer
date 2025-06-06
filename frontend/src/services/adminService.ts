// frontend/src/services/adminService.ts

import type { User } from "@/stores/auth";
import type { FileMetadata } from "@/services/fileService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * 通用的請求函式，用於處理 API 呼叫、Authorization 標頭和錯誤。
 * @param url API 端點路徑
 * @param options fetch API 的選項
 * @returns Promise<T>
 */
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem("accessToken");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `請求失敗，狀態碼: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

// --- 使用者管理 API ---

/**
 * (Admin) 獲取所有使用者列表
 * @param skip 跳過的筆數
 * @param limit 每頁筆數
 */
export async function getAllUsers(
  skip: number = 0,
  limit: number = 100
): Promise<User[]> {
  return request<User[]>(`${API_BASE_URL}/users/?skip=${skip}&limit=${limit}`);
}

/**
 * (Admin) 更新指定使用者的資訊
 * @param userId 使用者 ID
 * @param userData 要更新的資料 (例如 { role: 'manager', is_active: false })
 */
export async function updateUserByAdmin(
  userId: number,
  userData: Partial<Pick<User, "role" | "is_active">>
): Promise<User> {
  return request<User>(`${API_BASE_URL}/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(userData),
  });
}

/**
 * (Admin) 刪除指定使用者
 * @param userId 使用者 ID
 */
export async function deleteUserByAdmin(userId: number): Promise<User> {
  return request<User>(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
  });
}

// --- 檔案管理 API ---

/**
 * (Admin/Manager) 獲取所有檔案列表
 */
export async function getAllFiles(filter: {
  username?: string;
  email?: string;
}): Promise<FileMetadata[]> {
  const query = new URLSearchParams(filter as any).toString();
  return request<FileMetadata[]>(`${API_BASE_URL}/files/all?${query}`);
}

export async function createUserByAdmin(userData: any): Promise<User> {
  return request<User>(`${API_BASE_URL}/users/`, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function resetPasswordByAdmin(
  userId: number,
  newPassword: string
): Promise<void> {
  await request<void>(`${API_BASE_URL}/users/${userId}/reset-password`, {
    method: "PATCH",
    body: JSON.stringify({ new_password: newPassword }),
  });
}
