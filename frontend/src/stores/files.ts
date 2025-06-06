// frontend/src/stores/files.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as fileService from '@/services/fileService';
import type { FileMetadata } from '@/services/fileService'; // 從 service 匯入類型

export const useFilesStore = defineStore('files', () => {
  // State
  const files = ref<FileMetadata[]>([]);
  const isLoading = ref(false);
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

  return {
    files,
    isLoading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
  };
});