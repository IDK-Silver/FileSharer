<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4">儀表板</h1>
        <p v-if="authStore.user">歡迎回來, {{ authStore.user.username }}!</p>
      </v-col>
    </v-row>

    <v-divider class="my-4"></v-divider>

    <v-row>
      <v-col>
        <div class="d-flex align-center mb-4">
          <h2 class="text-h5">您的檔案</h2>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="uploadDialog = true">
            <v-icon left>mdi-upload</v-icon>
            上傳檔案
          </v-btn>
        </div>

        <v-progress-linear v-if="filesStore.isLoading" indeterminate color="primary"></v-progress-linear>

        <v-alert v-if="filesStore.error" type="error" class="mb-4">
          {{ filesStore.error }}
        </v-alert>

        <v-card v-if="!filesStore.isLoading && filesStore.files.length === 0 && !filesStore.error">
          <v-card-text class="text-center">
            您尚未上傳任何檔案。點擊右上角的按鈕開始上傳吧！
          </v-card-text>
        </v-card>
        
        <v-data-table
          v-else-if="!filesStore.isLoading"
          :headers="headers"
          :items="filesStore.files"
          item-key="id"
          class="elevation-1"
        >
          <template v-slot:item.size="{ item }">
            {{ formatBytes(item.size) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="handleDownload(item)">mdi-download</v-icon>
            <v-icon small class="mr-2" @click="handleShare(item)">mdi-share-variant</v-icon>
            <v-icon small @click="confirmDelete(item)">mdi-delete</v-icon>
          </template>
        </v-data-table>

      </v-col>
    </v-row>

    <FileUploadDialog v-model="uploadDialog" @upload-finished="onUploadFinished" />

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">確認刪除</v-card-title>
        <v-card-text>您確定要刪除檔案 "{{ fileToDelete?.filename }}" 嗎？此操作無法復原。</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" text @click="deleteDialog = false">取消</v-btn>
          <v-btn color="red-darken-1" text @click="handleDelete">確認</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useFilesStore } from '@/stores/files';
import type { FileMetadata } from '@/services/fileService';
import FileUploadDialog from '@/components/FileUploadDialog.vue'; // 確保路徑正確

const authStore = useAuthStore();
const filesStore = useFilesStore();

// 對話框狀態
const uploadDialog = ref(false);
const deleteDialog = ref(false);
const fileToDelete = ref<FileMetadata | null>(null);

// v-data-table 的表頭定義
const headers = [
  { title: '檔案名稱', key: 'filename', sortable: true },
  { title: '檔案大小', key: 'size', sortable: true },
  { title: '上傳日期', key: 'uploaded_at', sortable: true },
  { title: '操作', key: 'actions', sortable: false },
];

// 組件掛載時獲取檔案列表
onMounted(() => {
  filesStore.fetchFiles();
});

// 上傳完成後的回呼函式 (可以不用做任何事，因為 store 內部會刷新列表)
const onUploadFinished = () => {
  console.log('上傳完成，列表已刷新');
};

// 格式化檔案大小
const formatBytes = (bytes: number | null, decimals = 2) => {
  if (bytes === null || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 處理下載 (功能待實作)
const handleDownload = (item: FileMetadata) => {
  console.log('準備下載:', item);
  alert('下載功能待開發');
};

// 處理分享 (功能待實作)
const handleShare = (item: FileMetadata) => {
  console.log('準備分享:', item);
  alert('分享功能待開發');
};

// 顯示刪除確認對話框
const confirmDelete = (item: FileMetadata) => {
  fileToDelete.value = item;
  deleteDialog.value = true;
};

// 執行刪除
const handleDelete = () => {
  if (fileToDelete.value) {
    filesStore.deleteFile(fileToDelete.value.id);
  }
  deleteDialog.value = false;
  fileToDelete.value = null;
};
</script>