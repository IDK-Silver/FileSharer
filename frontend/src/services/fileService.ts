// frontend/src/services/fileService.ts

// 匯入通用的 request 函式，假設它與 authService 在同一個目錄或有統一的匯出點
// 為了簡化，我們直接從 authService.ts 複製 request 函式過來
// 在真實專案中，您可以將 request 函式抽到一個獨立的 api.ts 檔案中

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export interface FileMetadata {
  id: number;
  filename: string;
  file_type: string | null;
  size: number | null;
  uploaded_at: string;
  owner_id: number;
}
// --- 通用請求函式 (從 authService.ts 複製) ---
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
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
// --- 通用請求函式結束 ---


// 假設的 FileMetadata 類型 (應與後端 schemas/file.py 中的 FileRead 一致)
export interface FileMetadata {
  id: number;
  filename: string;
  file_type: string | null;
  size: number | null;
  uploaded_at: string; // datetime 會被轉為 string
  owner_id: number;
}

// 獲取使用者檔案列表
export async function getUserFiles(): Promise<FileMetadata[]> {
  return request<FileMetadata[]>(`${API_BASE_URL}/files/`);
}

// 上傳檔案
export async function uploadFile(file: File): Promise<FileMetadata> {
  const formData = new FormData();
  formData.append('uploaded_file', file);

  return request<FileMetadata>(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    body: formData, // FormData 會自動設定正確的 Content-Type (multipart/form-data)
  });
}

// 刪除檔案
export async function deleteFile(fileId: number): Promise<void> {
  await request<void>(`${API_BASE_URL}/files/${fileId}`, {
    method: 'DELETE',
  });
}

// 假設的 PresignedUrlResponse 類型 (應與後端 schemas/file.py 中的 PresignedUrlResponse 一致)
export interface PresignedUrlResponse {
  url: string;
  filename: string;
}

// 獲取檔案的分享/下載連結
export async function getFileShareLink(fileId: number, expire_seconds?: number): Promise<PresignedUrlResponse> {
  // 如果有過期時間參數，加到查詢字符串中
  let url = `${API_BASE_URL}/files/${fileId}/generate-share-link`;
  if (expire_seconds) {
    url += `?expire_seconds=${expire_seconds}`;
  }
  
  // 注意：雖然端點是 generate-share-link，但它實際上是產生一個預簽章 URL，可用於下載
  return request<PresignedUrlResponse>(url, {
    method: 'POST',
  });
}

export async function renameFile(
  fileId: number,
  newFilename: string
): Promise<FileMetadata> {
  return request<FileMetadata>(`${API_BASE_URL}/files/${fileId}/rename`, {
    method: "PATCH",
    body: JSON.stringify({ new_filename: newFilename }),
  });
}

export async function getAllFiles(): Promise<FileMetadata[]> {
  return request<FileMetadata[]>(`${API_BASE_URL}/files/all`);
}