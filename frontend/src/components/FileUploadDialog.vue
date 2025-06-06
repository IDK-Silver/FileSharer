<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue')" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">上傳新檔案</span>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleUpload">
            <v-file-input
              v-model="selectedFile"
              label="選擇檔案"
              placeholder="點擊此處選擇要上傳的檔案"
              prepend-icon="mdi-paperclip"
              show-size
              :loading="isUploading"
              :disabled="isUploading"
              :error-messages="error ? [error] : []"
              @change="error = null"
            ></v-file-input>
            
            <v-card-actions class="px-0 pt-4">
              <v-spacer></v-spacer>
              <v-btn color="grey-darken-1" variant="text" @click="closeDialog" :disabled="isUploading">
                取消
              </v-btn>
              <v-btn type="submit" color="primary" variant="elevated" :loading="isUploading">
                上傳
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useFilesStore } from '@/stores/files';
  
  defineProps<{ modelValue: boolean }>();
  const emit = defineEmits(['update:modelValue', 'upload-finished']);
  
  const filesStore = useFilesStore();
  // 修改：由於是非多選，直接用 ref<File | null> 更直觀
  const selectedFile = ref<File | null>(null);
  const isUploading = ref(false);
  const error = ref<string | null>(null);
  
  const closeDialog = () => {
    if (!isUploading.value) {
      emit('update:modelValue', false);
      // 延遲重設，避免對話框關閉動畫期間內容消失
      setTimeout(() => {
          selectedFile.value = null;
          error.value = null;
      }, 300);
    }
  };
  
  const handleUpload = async () => {
    // 增加更明確的日誌來偵錯
    console.log('準備上傳，選中的檔案物件:', selectedFile.value);
  
    if (!selectedFile.value) {
      error.value = '請先選擇一個檔案';
      return;
    }
    
    // 由於 v-file-input 的 v-model 在單選模式下是一個 File 陣列，我們取第一個
    // 修正：根據 Vuetify 3 文件，單選模式 v-model 也是 File[]，所以取第一個元素
    const fileToUpload = Array.isArray(selectedFile.value) ? selectedFile.value[0] : selectedFile.value;
  
    console.log('最終準備 append 到 FormData 的檔案:', fileToUpload);
  
    if (!fileToUpload) {
      error.value = '無效的檔案，請重新選擇。';
      return;
    }
  
    isUploading.value = true;
    error.value = null;
  
    try {
      await filesStore.uploadFile(fileToUpload);
      emit('upload-finished');
      closeDialog();
    } catch (e: any) {
      error.value = e.message || '上傳過程中發生錯誤';
    } finally {
      isUploading.value = false;
    }
  };
  </script>