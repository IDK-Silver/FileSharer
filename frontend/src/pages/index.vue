<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1 class="text-h4">個人檔案</h1>
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
            <v-icon>mdi-upload</v-icon>
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
          @click:row="(_, { item }) => showFileInfo(item)"
          hover
        >
          <template v-slot:item.size="{ item }">
            {{ formatBytes(item.size) }}
          </template>
          <template v-slot:item.uploaded_at="{ item }">
            {{ new Date(item.uploaded_at).toLocaleString() }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-rename-box" variant="text" @click.stop="openRenameDialog(item)">
                <v-icon>mdi-rename-box</v-icon>
                <v-tooltip activator="parent" location="top">重新命名</v-tooltip>
            </v-btn>
            <v-btn icon="mdi-download" variant="text" @click.stop="handleDownload(item)">
                <v-icon>mdi-download</v-icon>
                <v-tooltip activator="parent" location="top">下載</v-tooltip>
            </v-btn>
            <v-btn icon="mdi-share-variant" variant="text" @click.stop="handleShare(item)">
                <v-icon>mdi-share-variant</v-icon>
                <v-tooltip activator="parent" location="top">分享</v-tooltip>
            </v-btn>
            <v-btn icon="mdi-delete" variant="text" @click.stop="confirmDelete(item)">
                <v-icon>mdi-delete</v-icon>
                <v-tooltip activator="parent" location="top">刪除</v-tooltip>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>

  <!-- 右側檔案資訊抽屜 -->
  <v-navigation-drawer
    v-model="infoDrawer.show"
    location="right"
    width="350"
    app 
  >
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="infoDrawer.show = false"></v-btn>
      <v-toolbar-title>檔案資訊</v-toolbar-title>
    </v-toolbar>
    <v-divider></v-divider>

    <div v-if="selectedFile" class="pa-4">
      <div class="d-flex align-center justify-center bg-grey-lighten-2 rounded mb-4" style="height: 200px;">
          <v-icon size="80" color="grey">mdi-file-document-outline</v-icon>
      </div>
      
      <h3 class="text-h6 mb-2 text-wrap">{{ selectedFile.filename }}</h3>
      
      <v-list density="compact">
        <v-list-item>
          <v-list-item-title><strong>類型:</strong> {{ selectedFile.file_type || '未知' }}</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title><strong>大小:</strong> {{ formatBytes(selectedFile.size) }}</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title><strong>上傳於:</strong> {{ new Date(selectedFile.uploaded_at).toLocaleString() }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </div>
  </v-navigation-drawer>

  <!-- 檔案上傳對話框 -->
  <FileUploadDialog 
    v-model="uploadDialog" 
    @upload-finished="onUploadFinished"
  />

  <!-- 重新命名對話框 -->
  <v-dialog v-model="renameDialog.show" max-width="500px" persistent>
    <v-card>
      <v-card-title>重新命名檔案</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="renameDialog.newFilename"
          label="新的檔案名稱"
          :placeholder="renameDialog.oldFilename"
          :error-messages="renameDialog.error ? [renameDialog.error] : []"
          autofocus
          @keydown.enter="handleRename"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="renameDialog.show = false">取消</v-btn>
        <v-btn color="primary" text @click="handleRename" :loading="renameDialog.loading">確認</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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

// 顯示檔案資訊
const showFileInfo = (item: FileMetadata) => {
  selectedFile.value = item;
  infoDrawer.show = true; // 直接控制 v-model
};

// 開啟重新命名對話框
const openRenameDialog = (item: FileMetadata) => {
  renameDialog.fileId = item.id;
  renameDialog.oldFilename = item.filename;
  renameDialog.newFilename = item.filename; // 預填入舊檔名方便修改
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
      
      // 如果刪除的是當前選中的檔案，關閉右側面板
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