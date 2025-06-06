<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500px" persistent>
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
  // 修正類型：可能是單個檔案或檔案陣列
  const selectedFile = ref<File | File[] | null>(null);
  const isUploading = ref(false);
  const error = ref<string | null>(null);
  
  const closeDialog = () => {
    console.log('關閉對話框，目前上傳狀態:', isUploading.value);
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
    console.log('準備上傳，選中的檔案物件:', selectedFile.value);
    console.log('檔案物件類型:', typeof selectedFile.value);
    console.log('是否為陣列:', Array.isArray(selectedFile.value));
  
    if (!selectedFile.value) {
      error.value = '請先選擇一個檔案';
      return;
    }
    
    // 處理不同的檔案格式
    let fileToUpload: File;
    
    if (Array.isArray(selectedFile.value)) {
      // 如果是陣列，取第一個檔案
      if (selectedFile.value.length === 0) {
        error.value = '請先選擇一個檔案';
        return;
      }
      fileToUpload = selectedFile.value[0];
    } else {
      // 如果是單個檔案
      fileToUpload = selectedFile.value;
    }
    
    console.log('最終準備 append 到 FormData 的檔案:', fileToUpload);
    console.log('檔案名稱:', fileToUpload?.name);
    console.log('檔案大小:', fileToUpload?.size);
  
    if (!fileToUpload || !(fileToUpload instanceof File)) {
      error.value = '無效的檔案，請重新選擇。';
      return;
    }
  
    isUploading.value = true;
    error.value = null;
  
    try {
      await filesStore.uploadFile(fileToUpload);
      console.log('上傳成功，準備關閉對話框');
      
      // 先發送上傳完成事件
      emit('upload-finished');
      
      // 立即關閉對話框
      emit('update:modelValue', false);
      
      // 重設表單狀態
      setTimeout(() => {
        selectedFile.value = null;
        error.value = null;
      }, 300);
      
    } catch (e: any) {
      console.error('上傳失敗:', e);
      error.value = e.message || '上傳過程中發生錯誤';
    } finally {
      isUploading.value = false;
    }
  };
  </script>