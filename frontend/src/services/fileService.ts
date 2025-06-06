// frontend/src/services/fileService.ts

// 匯入通用的 request 函式，假設它與 authService 在同一個目錄或有統一的匯出點
// 為了簡化，我們直接從 authService.ts 複製 request 函式過來
// 在真實專案中，您可以將 request 函式抽到一個獨立的 api.ts 檔案中

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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