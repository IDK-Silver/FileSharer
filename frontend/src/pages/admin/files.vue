<template>
    <v-container fluid>
      <h1 class="text-h4 mb-4">檔案管理</h1>
      <v-card>
        <v-card-title>
          所有檔案列表
          <v-spacer></v-spacer>
          </v-card-title>
        <v-data-table
          :headers="headers"
          :items="adminStore.allFiles"
          :loading="adminStore.isLoading"
          item-key="id"
        >
          <template v-slot:item.owner_id="{ item }">
            {{ item.owner_id }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-delete" variant="text" @click="confirmDelete(item)"></v-btn>
          </template>
        </v-data-table>
      </v-card>
  
      <v-dialog v-model="deleteDialog.show" max-width="400px">
        </v-dialog>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, reactive } from 'vue';
  import { useAdminStore } from '@/stores/admin';
  import { useFilesStore } from '@/stores/files'; // 用於刪除操作
  import type { FileMetadata } from '@/services/fileService';
  
  const adminStore = useAdminStore();
  const filesStore = useFilesStore(); // 借用它的 deleteFile action
  
  const headers = [
    { title: '檔案名稱', value: 'filename' },
    { title: '擁有者ID', value: 'owner_id' },
    { title: '類型', value: 'file_type' },
    { title: '大小', value: 'size' },
    { title: '上傳時間', value: 'uploaded_at' },
    { title: '操作', value: 'actions', sortable: false },
  ];
  
  const deleteDialog = reactive({ show: false, file: null as FileMetadata | null });
  
  onMounted(() => {
    adminStore.fetchAllFiles();
  });
  
  const confirmDelete = (item: FileMetadata) => {
    deleteDialog.file = item;
    deleteDialog.show = true;
  };
  
  const handleDelete = async () => {
    if (deleteDialog.file) {
      await filesStore.deleteFile(deleteDialog.file.id);
      // 成功後從 adminStore 的列表中移除，避免重新請求
      adminStore.allFiles = adminStore.allFiles.filter(f => f.id !== deleteDialog.file!.id);
    }
    deleteDialog.show = false;
  };
  </script>