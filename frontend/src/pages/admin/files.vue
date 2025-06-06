<template>
  <v-container fluid class="pa-6">
    <!-- 頁面標題 -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">檔案管理</h1>
        <p class="text-body-2 text-grey mt-1">管理系統中的所有檔案</p>
      </div>
      <v-spacer></v-spacer>
      <v-chip variant="outlined" color="primary" class="mr-2">
        <v-icon start>mdi-file-multiple</v-icon>
        總計 {{ adminStore.allFiles.length }} 個檔案
      </v-chip>
    </div>

    <!-- 主要卡片 -->
    <v-card rounded="lg" elevation="2" class="files-card">
      <!-- 卡片標題和搜尋 -->
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center w-100">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-database</v-icon>
            <span class="text-h6 font-weight-medium">所有檔案列表</span>
          </div>
          
          <v-spacer></v-spacer>
          
          <!-- 搜尋區域 -->
          <div class="d-flex align-center search-container">
            <v-text-field
              v-model="search"
              label="依使用者名稱篩選"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              single-line
              clearable
              class="search-field"
              @click:clear="clearSearch"
              @keydown.enter="applyFilter"
            ></v-text-field>
            <v-btn 
              color="primary" 
              variant="elevated"
              class="ml-2 text-none"
              @click="applyFilter"
              :loading="adminStore.isLoadingFiles"
            >
              <v-icon start>mdi-magnify</v-icon>
              搜尋
            </v-btn>
            <v-btn 
              icon
              variant="text"
              class="ml-1"
              @click="refreshData"
              :loading="adminStore.isLoadingFiles"
            >
              <v-icon>mdi-refresh</v-icon>
              <v-tooltip activator="parent" location="top">重新整理</v-tooltip>
            </v-btn>
          </div>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <!-- 資料表格 -->
      <v-data-table
        :headers="headers"
        :items="adminStore.allFiles"
        :loading="adminStore.isLoadingFiles"
        item-value="id"
        class="files-table"
        :items-per-page="15"
        :loading-text="'載入檔案資料中...'"
        :no-data-text="'沒有找到檔案'"
      >
        <!-- 檔案名稱欄位 -->
        <template v-slot:item.filename="{ item }">
          <div class="d-flex align-center">
            <v-icon :color="getFileTypeColor(item.file_type)" class="mr-2">
              {{ getFileTypeIcon(item.file_type) }}
            </v-icon>
            <div>
              <div class="font-weight-medium">{{ item.filename }}</div>
              <div class="text-caption text-grey">{{ item.file_type }}</div>
            </div>
          </div>
        </template>

        <!-- 擁有者ID欄位 -->
        <template v-slot:item.owner_id="{ item }">
          <v-chip size="small" variant="outlined" color="primary">
            <v-icon start size="16">mdi-identifier</v-icon>
            ID: {{ item.owner_id }}
          </v-chip>
        </template>

        <!-- 檔案大小欄位 -->
        <template v-slot:item.size="{ item }">
          <span class="font-weight-medium">{{ formatBytes(item.size) }}</span>
        </template>

        <!-- 上傳時間欄位 -->
        <template v-slot:item.uploaded_at="{ item }">
          <div>
            <div class="font-weight-medium">{{ formatDate(item.uploaded_at) }}</div>
            <div class="text-caption text-grey">{{ formatTime(item.uploaded_at) }}</div>
          </div>
        </template>

        <!-- 操作欄位 -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center">
            <v-btn 
              icon 
              variant="text" 
              color="primary"
              size="small"
              @click="handleDownload(item)"
            >
              <v-icon>mdi-download</v-icon>
              <v-tooltip activator="parent" location="top">下載</v-tooltip>
            </v-btn>
            <v-btn 
              icon 
              variant="text" 
              color="error"
              size="small"
              @click="confirmDelete(item)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">刪除</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- 載入中狀態 -->
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
        </template>
      </v-data-table>
    </v-card>

    <!-- 刪除確認對話框 -->
    <v-dialog v-model="deleteDialog.show" max-width="450px" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
            <span class="text-h6 font-weight-bold">確認刪除檔案</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6 pt-2">
          <div class="mb-4">
            <p class="text-body-1 mb-3">您確定要刪除以下檔案嗎？</p>
            <v-card variant="outlined" class="pa-4">
              <div class="d-flex align-center">
                <v-icon :color="getFileTypeColor(deleteDialog.file?.file_type)" class="mr-3">
                  {{ getFileTypeIcon(deleteDialog.file?.file_type) }}
                </v-icon>
                <div>
                  <div class="font-weight-medium">{{ deleteDialog.file?.filename }}</div>
                  <div class="text-caption text-grey">
                    擁有者ID: {{ deleteDialog.file?.owner_id }} | 
                    大小: {{ formatBytes(deleteDialog.file?.size) }}
                  </div>
                </div>
              </div>
            </v-card>
          </div>
          <v-alert type="warning" variant="tonal" class="mb-0">
            <v-icon>mdi-information</v-icon>
            此操作無法復原，檔案將被永久刪除
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="outlined"
            class="text-none"
            @click="deleteDialog.show = false"
            :disabled="deleteDialog.loading"
          >
            取消
          </v-btn>
          <v-btn 
            color="error" 
            variant="elevated"
            class="text-none"
            @click="handleDelete"
            :loading="deleteDialog.loading"
          >
            <v-icon start>mdi-delete</v-icon>
            確定刪除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 通知 Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color"
      rounded="lg"
      class="mb-4"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { useFilesStore } from '@/stores/files';
import type { FileMetadata } from '@/services/fileService';

const adminStore = useAdminStore();
const filesStore = useFilesStore();

const search = ref('');
const snackbar = reactive({ show: false, text: '', color: 'success' });

const headers = [
  { title: '檔案名稱', key: 'filename', width: '25%' },
  { title: '擁有者ID', key: 'owner_id', width: '15%' },
  { title: '大小', key: 'size', width: '12%' },
  { title: '上傳時間', key: 'uploaded_at', width: '20%' },
  { title: '操作', key: 'actions', sortable: false, width: '15%', align: 'center' },
];

const deleteDialog = reactive({ 
  show: false, 
  file: null as FileMetadata | null,
  loading: false
});

onMounted(() => {
  adminStore.fetchAllFiles();
});

// 搜尋和篩選功能
const applyFilter = () => {
  adminStore.fetchAllFiles({ username: search.value });
};

const clearSearch = () => {
  search.value = '';
  adminStore.fetchAllFiles();
};

const refreshData = () => {
  adminStore.fetchAllFiles({ username: search.value });
};

// 檔案操作
const confirmDelete = (item: FileMetadata) => {
  deleteDialog.file = item;
  deleteDialog.show = true;
};

const handleDelete = async () => {
  if (!deleteDialog.file) return;
  
  deleteDialog.loading = true;
  try {
    await filesStore.deleteFile(deleteDialog.file.id);
    adminStore.allFiles = adminStore.allFiles.filter(f => f.id !== deleteDialog.file!.id);
    
    snackbar.text = '檔案刪除成功';
    snackbar.color = 'success';
    snackbar.show = true;
  } catch (error) {
    snackbar.text = '檔案刪除失敗';
    snackbar.color = 'error';
    snackbar.show = true;
  } finally {
    deleteDialog.loading = false;
    deleteDialog.show = false;
  }
};

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

// 工具函數
const formatBytes = (bytes: number | null): string => {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-TW');
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('zh-TW');
};

const getFileTypeIcon = (fileType: string): string => {
  const iconMap: Record<string, string> = {
    'image/jpeg': 'mdi-file-image',
    'image/png': 'mdi-file-image',
    'image/gif': 'mdi-file-image',
    'application/pdf': 'mdi-file-pdf-box',
    'text/plain': 'mdi-file-document',
    'application/msword': 'mdi-file-word',
    'application/vnd.ms-excel': 'mdi-file-excel',
    'video/mp4': 'mdi-file-video',
    'audio/mpeg': 'mdi-file-music',
  };
  return iconMap[fileType] || 'mdi-file';
};

const getFileTypeColor = (fileType: string): string => {
  const colorMap: Record<string, string> = {
    'image/jpeg': 'green',
    'image/png': 'green',
    'image/gif': 'green',
    'application/pdf': 'red',
    'text/plain': 'blue',
    'application/msword': 'indigo',
    'application/vnd.ms-excel': 'teal',
    'video/mp4': 'purple',
    'audio/mpeg': 'orange',
  };
  return colorMap[fileType] || 'grey';
};
</script>

<style scoped>
/* 主要卡片樣式 */
.files-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* 搜尋容器樣式 */
.search-container {
  min-width: 400px;
}

/* 搜尋欄位樣式 */
.search-field {
  min-width: 320px;
}

.search-field :deep(.v-field) {
  background-color: #fafafa;
}

.search-field :deep(.v-field--focused) {
  background-color: white;
}

/* 表格樣式 */
.files-table :deep(.v-data-table__td) {
  padding: 12px 16px;
}

.files-table :deep(.v-data-table__th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #424242;
}

.files-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(25, 118, 210, 0.04) !important;
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .search-container {
    min-width: 350px;
  }
  
  .search-field {
    min-width: 280px;
  }
}

@media (max-width: 960px) {
  .v-container {
    padding: 16px !important;
  }
  
  .d-flex.align-center.w-100 {
    flex-direction: column;
    gap: 16px;
    align-items: stretch !important;
  }
  
  .search-container {
    min-width: auto;
    width: 100%;
  }
  
  .search-field {
    min-width: auto;
    flex: 1;
  }
}

@media (max-width: 600px) {
  .files-table :deep(.v-data-table__td),
  .files-table :deep(.v-data-table__th) {
    padding: 8px 12px;
    font-size: 0.875rem;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .v-card-title {
    padding: 16px !important;
  }
  
  .search-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .search-field {
    width: 100%;
  }
}
</style>