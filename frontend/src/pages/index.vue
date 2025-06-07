<template>
  <v-container fluid class="pa-6">
    <!-- 歡迎區塊 -->
    <v-row class="mb-6">
      <v-col>
        <v-card class="pa-3 bg-gradient-primary" elevation="0">
          <div class="d-flex align-center">
            <div>
              <h1 class="text-h5 font-weight-bold text-white mb-2">
                <v-icon icon="mdi-folder-multiple" class="mr-3" size="medium"></v-icon>
                個人檔案
              </h1>
              <p class="text-body-2 text-white opacity-90 mb-0" v-if="authStore.user">
                歡迎回來, {{ authStore.user.username }}！
              </p>
            </div>
            <v-spacer></v-spacer>
            <v-avatar size="56" color="white" class="elevation-2">
              <v-icon icon="mdi-account" size="32" color="primary"></v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 檔案管理區塊 -->
    <v-row>
      <v-col>
        <v-card class="elevation-4" rounded="lg">
          <v-card-title class="d-flex align-center pa-6 bg-grey-lighten-5">
            <v-icon icon="mdi-file-document-multiple" class="mr-3" color="primary"></v-icon>
            <span class="text-h5 font-weight-medium">您的檔案</span>
            <v-spacer></v-spacer>

            <!-- 統計資訊 -->
            <v-chip v-if="!filesStore.isLoading" color="primary" variant="outlined" class="mr-4">
              <v-icon start icon="mdi-file-document"></v-icon>
              {{ filesStore.files.length }} 個檔案
            </v-chip>

            <v-btn color="primary" size="large" rounded="lg" elevation="2" @click="uploadDialog = true" class="px-6">
              <v-icon start icon="mdi-cloud-upload"></v-icon>
              上傳檔案
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-0">
            <!-- 載入指示器 -->
            <v-progress-linear v-if="filesStore.isLoading" indeterminate color="primary" height="4"></v-progress-linear>

            <!-- 錯誤提示 -->
            <v-alert v-if="filesStore.error" type="error" class="ma-4 rounded-lg" variant="tonal">
              <v-icon start icon="mdi-alert-circle"></v-icon>
              {{ filesStore.error }}
            </v-alert>

            <!-- 空狀態 -->
            <div v-if="!filesStore.isLoading && filesStore.files.length === 0 && !filesStore.error"
              class="text-center pa-12">
              <v-icon icon="mdi-folder-open" size="120" color="grey-lighten-2" class="mb-4"></v-icon>
              <h3 class="text-h5 text-grey-darken-1 mb-3">還沒有檔案</h3>
              <p class="text-body-1 text-grey mb-6">開始上傳您的第一個檔案吧！</p>
              <v-btn color="primary" size="large" rounded="lg" @click="uploadDialog = true" class="px-8">
                <v-icon start icon="mdi-plus"></v-icon>
                立即上傳
              </v-btn>
            </div>

            <!-- 檔案表格 -->
            <v-data-table v-else-if="!filesStore.isLoading" :headers="headers" :items="filesStore.files"
              :loading="filesStore.isLoading" item-key="id" class="file-table" @click:row="handleRowClick" hover
              :items-per-page="10">
              <template v-slot:item.filename="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar size="40" class="mr-3" color="primary-lighten-4">
                    <v-icon :icon="getFileIcon(item.file_type)" color="primary"></v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-medium">{{ item.filename }}</div>
                    <div class="text-caption text-grey-darken-1">{{ item.file_type || '未知類型' }}</div>
                  </div>
                </div>
              </template>

              <template v-slot:item.size="{ item }">
                <v-chip size="small" color="info" variant="outlined">
                  {{ formatBytes(item.size) }}
                </v-chip>
              </template>

              <template v-slot:item.uploaded_at="{ item }">
                <div class="text-body-2">
                  {{ formatDate(item.uploaded_at) }}
                </div>
              </template>

              <template v-slot:item.actions="{ item }">
                <div class="d-flex">
                  <v-btn icon="mdi-rename-box" variant="text" size="small" color="info"
                    @click.stop="openRenameDialog(item)">
                    <v-icon>mdi-rename-box</v-icon>
                    <v-tooltip activator="parent" location="top">重新命名</v-tooltip>
                  </v-btn>
                  <v-btn icon="mdi-download" variant="text" size="small" color="success"
                    @click.stop="handleDownload(item)">
                    <v-icon>mdi-download</v-icon>
                    <v-tooltip activator="parent" location="top">下載</v-tooltip>
                  </v-btn>
                  <v-btn icon="mdi-share-variant" variant="text" size="small" color="primary"
                    @click.stop="handleShare(item)">
                    <v-icon>mdi-share-variant</v-icon>
                    <v-tooltip activator="parent" location="top">分享</v-tooltip>
                  </v-btn>
                  <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click.stop="confirmDelete(item)">
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">刪除</v-tooltip>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- 右側檔案資訊抽屜 -->
  <v-navigation-drawer v-model="infoDrawer.show" location="right" width="380" app class="elevation-8">
    <v-toolbar color="primary" dark elevation="0">
      <v-btn icon="mdi-close" @click="infoDrawer.show = false"></v-btn>
      <v-toolbar-title class="font-weight-medium">檔案資訊</v-toolbar-title>
    </v-toolbar>

    <div v-if="selectedFile" class="pa-6">
      <!-- 檔案預覽區域 -->
      <v-card class="mb-6 elevation-2" rounded="lg">
        <v-img v-if="isImage(selectedFile.file_type) && previewUrl" :src="previewUrl" height="200" class="rounded-lg"
          cover>
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
              <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
            </div>
          </template>
          <template v-slot:error>
            <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
              <v-icon icon="mdi-alert-circle-outline" size="60" color="grey"></v-icon>
            </div>
          </template>
        </v-img>
        <div v-else class="d-flex align-center justify-center bg-gradient-secondary rounded-lg" style="height: 200px;">
          <v-icon :icon="getFileIcon(selectedFile.file_type)" size="80" color="white"></v-icon>
        </div>
      </v-card>

      <!-- 檔案名稱 -->
      <h3 class="text-h6 mb-4 text-wrap font-weight-medium">{{ selectedFile.filename }}</h3>

      <!-- 檔案詳細資訊 -->
      <v-card variant="outlined" rounded="lg">
        <v-list class="pa-0">
          <v-list-item class="px-4">
            <template v-slot:prepend>
              <v-icon icon="mdi-tag" color="info" class="mr-3"></v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">類型</v-list-item-title>
            <v-list-item-subtitle>{{ selectedFile.file_type || '未知' }}</v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item class="px-4">
            <template v-slot:prepend>
              <v-icon icon="mdi-harddisk" color="success" class="mr-3"></v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">大小</v-list-item-title>
            <v-list-item-subtitle>{{ formatBytes(selectedFile.size) }}</v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item class="px-4">
            <template v-slot:prepend>
              <v-icon icon="mdi-calendar" color="warning" class="mr-3"></v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">上傳時間</v-list-item-title>
            <v-list-item-subtitle>{{ formatDate(selectedFile.uploaded_at) }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </div>
  </v-navigation-drawer>

  <!-- 檔案上傳對話框 -->
  <FileUploadDialog v-model="uploadDialog" @upload-finished="onUploadFinished" />

  <!-- 重新命名對話框 -->
  <v-dialog v-model="renameDialog.show" max-width="500px" persistent>
    <v-card rounded="lg" elevation="8">
      <v-card-title class="d-flex align-center pa-6 bg-primary text-white">
        <v-icon icon="mdi-rename-box" class="mr-3"></v-icon>
        重新命名檔案
      </v-card-title>
      <v-card-text class="pa-6">
        <v-text-field v-model="renameDialog.newFilename" label="新的檔案名稱" :placeholder="renameDialog.oldFilename"
          :error-messages="renameDialog.error ? [renameDialog.error] : []" variant="outlined" rounded="lg" autofocus
          @keydown.enter="handleRename"></v-text-field>
      </v-card-text>
      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="outlined" @click="renameDialog.show = false">取消</v-btn>
        <v-btn color="primary" @click="handleRename" :loading="renameDialog.loading">確認</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 分享對話框 -->
  <v-dialog v-model="shareDialog.show" max-width="600px">
    <v-card rounded="lg" elevation="8">
      <v-card-title class="d-flex align-center pa-6 bg-success text-white">
        <v-icon icon="mdi-share-variant" class="mr-3"></v-icon>
        分享檔案
      </v-card-title>
      <v-card-text class="pa-6">
        <p class="text-body-1 mb-4">這是您的分享連結，它將在 1 小時後失效：</p>
        <v-text-field v-model="shareDialog.url" readonly variant="outlined" rounded="lg"
          append-inner-icon="mdi-content-copy" @click:append-inner="copyToClipboard" hide-details></v-text-field>
      </v-card-text>
      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="success" @click="shareDialog.show = false">關閉</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 確認刪除對話框 -->
  <v-dialog v-model="deleteDialog.show" max-width="400px">
    <v-card rounded="lg" elevation="8">
      <v-card-title class="d-flex align-center pa-6 bg-error text-white">
        <v-icon icon="mdi-delete" class="mr-3"></v-icon>
        確認刪除
      </v-card-title>
      <v-card-text class="pa-6">
        <div class="text-center mb-4">
          <v-icon icon="mdi-alert-circle" size="80" color="error" class="mb-4"></v-icon>
          <p class="text-body-1">
            確定要刪除檔案 <strong>"{{ deleteDialog.filename }}"</strong> 嗎？
          </p>
          <p class="text-caption text-error">此操作無法撤銷。</p>
        </div>
      </v-card-text>
      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="outlined" @click="deleteDialog.show = false">取消</v-btn>
        <v-btn color="error" @click="handleDelete">確認刪除</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 通用提示框 -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg" elevation="6" location="top right">
    <div class="d-flex align-center">
      <v-icon :icon="snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'" class="mr-2"></v-icon>
      {{ snackbar.text }}
    </div>
  </v-snackbar>
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

// 右側資訊抽屜狀態
const infoDrawer = reactive({ show: false });
const selectedFile = ref<FileMetadata | null>(null);

// 預覽 URL - 明確指定可以是 string 或 null
const previewUrl = ref<string | null>(null);

// 重新命名對話框狀態
const renameDialog = reactive({
  show: false,
  loading: false,
  fileId: null as number | null,
  newFilename: '',
  oldFilename: '',
  error: '',
});

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
  { title: '檔案名稱', key: 'filename', width: '40%' },
  { title: '大小', key: 'size', width: '15%' },
  { title: '上傳時間', key: 'uploaded_at', width: '25%' },
  { title: '操作', key: 'actions', sortable: false, width: '20%' },
];

// 頁面載入時獲取檔案列表
onMounted(() => {
  filesStore.fetchFiles();
});

// 處理行點擊事件 - 將類型註解移到 script 中
const handleRowClick = (event: any, { item }: { item: FileMetadata }) => {
  showFileInfo(item);
};

// 根據檔案類型返回對應圖示
const getFileIcon = (fileType: string | null): string => {
  if (!fileType) return 'mdi-file-document-outline';

  if (fileType.startsWith('image/')) return 'mdi-file-image';
  if (fileType.startsWith('video/')) return 'mdi-file-video';
  if (fileType.startsWith('audio/')) return 'mdi-file-music';
  if (fileType.includes('pdf')) return 'mdi-file-pdf-box';
  if (fileType.includes('word')) return 'mdi-file-word';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'mdi-file-excel';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'mdi-file-powerpoint';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return 'mdi-folder-zip';
  if (fileType.includes('text')) return 'mdi-file-document';

  return 'mdi-file-document-outline';
};

// isImage 輔助函式
const isImage = (fileType: string | null): boolean => {
  return fileType ? fileType.startsWith('image/') : false;
};

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 顯示檔案資訊
const showFileInfo = async (item: FileMetadata) => {
  selectedFile.value = item;
  infoDrawer.show = true;
  previewUrl.value = null; // 先清除舊的預覽

  // 如果是圖片類型，則為它產生一個預覽連結
  if (isImage(item.file_type)) {
    try {
      // 請求一個短時效的 URL 用於預覽 (例如 5 分鐘)
      const linkInfo = await filesStore.generateShareLink(item.id, 300);
      if (linkInfo && linkInfo.url) {
        previewUrl.value = linkInfo.url;
      }
    } catch (error) {
      console.error('無法獲取圖片預覽連結:', error);
      // 如果獲取失敗，previewUrl 保持為 null
    }
  }
};

// 開啟重新命名對話框
const openRenameDialog = (item: FileMetadata) => {
  renameDialog.fileId = item.id;
  renameDialog.oldFilename = item.filename;
  renameDialog.newFilename = item.filename;
  renameDialog.error = '';
  renameDialog.show = true;
};

// 處理重新命名
const handleRename = async () => {
  if (!renameDialog.fileId || !renameDialog.newFilename) return;

  renameDialog.loading = true;
  renameDialog.error = '';
  try {
    await filesStore.renameFile(renameDialog.fileId, renameDialog.newFilename);
    renameDialog.show = false;
    if (selectedFile.value && selectedFile.value.id === renameDialog.fileId) {
      selectedFile.value.filename = renameDialog.newFilename;
    }
    snackbar.text = '檔案重新命名成功';
    snackbar.color = 'success';
    snackbar.show = true;
  } catch (e: any) {
    renameDialog.error = e.message || '重新命名失敗';
  } finally {
    renameDialog.loading = false;
  }
};

// 上傳完成後的回調
const onUploadFinished = () => {
  uploadDialog.value = false;
  filesStore.fetchFiles();
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
  try {
    const linkInfo = await filesStore.generateShareLink(item.id);
    if (linkInfo && linkInfo.url) {
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
  try {
    const linkInfo = await filesStore.generateShareLink(item.id, 3600);
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

      if (selectedFile.value && selectedFile.value.id === deleteDialog.fileId) {
        selectedFile.value = null;
        infoDrawer.show = false;
      }
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

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.bg-gradient-secondary {
  background: linear-gradient(135deg, #424242 0%, #757575 100%);
}

.file-table :deep(.v-data-table__wrapper) {
  border-radius: 0 0 12px 12px;
}

.file-table :deep(tr:hover) {
  background-color: rgba(25, 118, 210, 0.04) !important;
}

.elevation-4 {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

.elevation-8 {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
}
</style>