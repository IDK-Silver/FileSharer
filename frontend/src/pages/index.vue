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
          :loading="filesStore.isLoading"
          item-key="id"
          class="elevation-1"
        >
          <template v-slot:item.size="{ item }">
            {{ formatBytes(item.size) }}
          </template>
          <template v-slot:item.uploaded_at="{ item }">
            {{ new Date(item.uploaded_at).toLocaleString() }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon variant="text" @click="handleDownload(item)">
              <v-icon>mdi-download</v-icon>
              <v-tooltip activator="parent" location="top">下載</v-tooltip>
            </v-btn>
            <v-btn icon variant="text" @click="handleShare(item)">
              <v-icon>mdi-share-variant</v-icon>
              <v-tooltip activator="parent" location="top">分享</v-tooltip>
            </v-btn>
            <v-btn icon variant="text" @click="confirmDelete(item)">
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">刪除</v-tooltip>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- 檔案上傳對話框 -->
    <FileUploadDialog 
      v-model="uploadDialog" 
      @upload-finished="onUploadFinished"
    />

    <!-- 分享對話框 -->
    <v-dialog v-model="shareDialog.show" max-width="600px">
      <v-card>
        <v-card-title>分享檔案</v-card-title>
        <v-card-text>
          <p>這是您的分享連結，它將在 1 小時後失效：</p>
          <v-text-field
            v-model="shareDialog.url"
            readonly
            class="mt-4"
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copyToClipboard"
            hide-details
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="shareDialog.show = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <v-dialog v-model="deleteDialog.show" max-width="400px">
      <v-card>
        <v-card-title>確認刪除</v-card-title>
        <v-card-text>
          確定要刪除檔案 "{{ deleteDialog.filename }}" 嗎？此操作無法撤銷。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="deleteDialog.show = false">取消</v-btn>
          <v-btn color="red" text @click="handleDelete">刪除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 通用提示框 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useFilesStore } from '@/stores/files';
import type { FileMetadata } from '@/services/fileService';
import FileUploadDialog from '@/components/FileUploadDialog.vue';

const authStore = useAuthStore();
const filesStore = useFilesStore();

// 上傳對話框狀態
const uploadDialog = ref(false);

// 分享對話框的狀態
const shareDialog = reactive({
  show: false,
  url: '',
});

// 刪除對話框狀態
const deleteDialog = reactive({
  show: false,
  fileId: null as number | null,
  filename: '',
});

// 通用提示框狀態
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
});

// 表格標題
const headers = [
  { title: '檔案名稱', value: 'filename' },
  { title: '類型', value: 'file_type' },
  { title: '大小', value: 'size' },
  { title: '上傳時間', value: 'uploaded_at' },
  { title: '操作', value: 'actions', sortable: false },
];

// 頁面載入時獲取檔案列表
onMounted(() => {
  filesStore.fetchFiles();
});

// 上傳完成後的回調
const onUploadFinished = () => {
  uploadDialog.value = false;
  filesStore.fetchFiles(); // 重新載入檔案列表
};

// 格式化檔案大小
const formatBytes = (bytes: number | null): string => {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// 處理下載
const handleDownload = async (item: FileMetadata) => {
  console.log('準備下載:', item);
  try {
    const linkInfo = await filesStore.generateShareLink(item.id);
    if (linkInfo && linkInfo.url) {
      // 創建一個隱藏的 a 標籤來觸發下載
      const link = document.createElement('a');
      link.href = linkInfo.url;
      link.setAttribute('download', item.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('下載失敗:', error);
    snackbar.text = filesStore.error || '無法取得下載連結';
    snackbar.color = 'error';
    snackbar.show = true;
  }
};

// 處理分享
const handleShare = async (item: FileMetadata) => {
  console.log('準備分享:', item);
  try {
    const linkInfo = await filesStore.generateShareLink(item.id, 3600); // 1小時後過期
    if (linkInfo && linkInfo.url) {
      shareDialog.url = linkInfo.url;
      shareDialog.show = true;
    }
  } catch (error) {
    console.error('分享失敗:', error);
    snackbar.text = filesStore.error || '無法產生分享連結';
    snackbar.color = 'error';
    snackbar.show = true;
  }
};

// 複製到剪貼簿
const copyToClipboard = () => {
  navigator.clipboard.writeText(shareDialog.url).then(() => {
    snackbar.text = '連結已複製到剪貼簿！';
    snackbar.color = 'success';
    snackbar.show = true;
  }).catch(err => {
    console.error('複製失敗:', err);
    snackbar.text = '複製失敗';
    snackbar.color = 'error';
    snackbar.show = true;
  });
};

// 確認刪除
const confirmDelete = (item: FileMetadata) => {
  deleteDialog.fileId = item.id;
  deleteDialog.filename = item.filename;
  deleteDialog.show = true;
};

// 處理刪除
const handleDelete = async () => {
  if (deleteDialog.fileId) {
    try {
      await filesStore.deleteFile(deleteDialog.fileId);
      snackbar.text = '檔案已刪除';
      snackbar.color = 'success';
      snackbar.show = true;
    } catch (error) {
      console.error('刪除失敗:', error);
      snackbar.text = filesStore.error || '刪除檔案失敗';
      snackbar.color = 'error';
      snackbar.show = true;
    }
  }
  deleteDialog.show = false;
  deleteDialog.fileId = null;
  deleteDialog.filename = '';
};
</script>