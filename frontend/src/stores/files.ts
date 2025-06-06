// frontend/src/stores/files.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as fileService from '@/services/fileService';
import type { FileMetadata, PresignedUrlResponse } from '@/services/fileService'; // 從 service 匯入類型

export const useFilesStore = defineStore('files', () => {
  // State
  const files = ref<FileMetadata[]>([]);
  const isLoading = ref(false);
  const shareLoading = ref(false); // 為分享操作增加獨立的 loading 狀態
  const error = ref<string | null>(null);

  // Actions
  async function fetchFiles() {
    isLoading.value = true;
    error.value = null;
    try {
      files.value = await fileService.getUserFiles();
    } catch (e: any) {
      error.value = e.message || '無法獲取檔案列表';
    } finally {
      isLoading.value = false;
    }
  }

  async function uploadFile(file: File) {
    // 這裡可以增加一個 uploading 的狀態
    isLoading.value = true; // 簡單共用 loading 狀態
    error.value = null;
    try {
      await fileService.uploadFile(file);
      await fetchFiles(); // 上傳成功後，重新整理檔案列表
    } catch (e: any) {
      error.value = e.message || '檔案上傳失敗';
      // 將錯誤向上拋出，讓 UI 層可以捕捉並處理
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteFile(fileId: number) {
    // 為了更好的使用者體驗，可以先從列表中移除該檔案，失敗再加回去
    const originalFiles = [...files.value];
    files.value = files.value.filter(f => f.id !== fileId);
    error.value = null;

    try {
      await fileService.deleteFile(fileId);
    } catch (e: any) {
      error.value = e.message || '刪除檔案失敗';
      files.value = originalFiles; // 刪除失敗，恢復原始列表
    }
  }

  async function generateShareLink(fileId: number, expireSeconds?: number): Promise<PresignedUrlResponse | null> {
    shareLoading.value = true;
    error.value = null;
    try {
      const response = await fileService.getFileShareLink(fileId, expireSeconds);
      return response;
    } catch (e: any) {
      error.value = e.message || '無法產生分享連結';
      return null;
    } finally {
      shareLoading.value = false;
    }
  }

  async function renameFile(fileId: number, newFilename: string) {
    try {
      const updatedFile = await fileService.renameFile(fileId, newFilename);
      const index = files.value.findIndex((f) => f.id === fileId);
      if (index !== -1) {
        files.value[index] = updatedFile;
      }
    } catch (e: any) {
      // ... error 處理 ...
      throw e;
    }
  }

  
  return {
    files,
    isLoading,
    shareLoading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
    generateShareLink,
    renameFile,
  };
});