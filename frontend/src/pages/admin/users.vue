<template>
    <v-container fluid>
      <h1 class="text-h4 mb-4">使用者管理</h1>
  
      <v-card>
        <v-card-title>
          <div class="d-flex align-center">
            使用者列表
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-refresh"
              variant="text"
              @click="adminStore.fetchUsers"
              :loading="adminStore.isLoadingUsers"
            ></v-btn>
          </div>
        </v-card-title>
        
        <v-data-table
          :headers="headers"
          :items="adminStore.users"
          :loading="adminStore.isLoadingUsers"
          item-value="id"
          class="elevation-1"
        >
          <template v-slot:item.role="{ item }">
            <v-chip :color="getRoleColor(item.role)" size="small">{{ item.role }}</v-chip>
          </template>
  
          <template v-slot:item.is_active="{ item }">
            <v-chip :color="item.is_active ? 'green' : 'grey'" size="small">{{ item.is_active ? '啟用' : '停用' }}</v-chip>
          </template>
          
          <template v-slot:item.actions="{ item }">
            <div class="d-flex">
              <v-btn icon="mdi-pencil" variant="text" @click="openEditDialog(item)" :disabled="isMyself(item.id)">
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">編輯</v-tooltip>
              </v-btn>
              <v-btn icon="mdi-delete" variant="text" @click="openDeleteDialog(item)" :disabled="isMyself(item.id)">
                <v-icon>mdi-delete</v-icon>
                <v-tooltip activator="parent" location="top">刪除</v-tooltip>
              </v-btn>
            </div>
          </template>
  
          <template v-slot:no-data>
            <div class="text-center pa-4">沒有找到使用者資料。</div>
          </template>
        </v-data-table>
      </v-card>
  
      <v-dialog v-model="editDialog.show" max-width="500px" persistent>
        <v-card :loading="editDialog.loading">
          <v-card-title>編輯使用者: {{ editDialog.username }}</v-card-title>
          <v-card-text>
            <v-select
              v-model="editDialog.role"
              :items="['admin', 'manager', 'user']"
              label="角色"
              class="mb-4"
            ></v-select>
            <v-switch
              v-model="editDialog.isActive"
              :label="`帳號狀態: ${editDialog.isActive ? '啟用' : '停用'}`"
              color="primary"
              hide-details
            ></v-switch>
             <v-alert v-if="editDialog.error" type="error" class="mt-4" dense>
              {{ editDialog.error }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeEditDialog">取消</v-btn>
            <v-btn color="primary" text @click="handleUpdateUser">儲存</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <v-dialog v-model="deleteDialog.show" max-width="400px" persistent>
        <v-card>
          <v-card-title>確認刪除</v-card-title>
          <v-card-text>
            您確定要刪除使用者 <strong>"{{ deleteDialog.username }}"</strong> 嗎？此操作無法復原。
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="deleteDialog.show = false">取消</v-btn>
            <v-btn color="red" text @click="handleDeleteUser">確認刪除</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, reactive, computed } from 'vue';
  import { useAdminStore } from '@/stores/admin';
  import { useAuthStore } from '@/stores/auth';
  import type { User } from '@/stores/auth';
  
  const adminStore = useAdminStore();
  const authStore = useAuthStore();
  
  const headers = [
    { title: 'ID', key: 'id', align: 'start', width: '80px' },
    { title: '使用者名稱', key: 'username' },
    { title: '電子郵件', key: 'email' },
    { title: '角色', key: 'role' },
    { title: '狀態', key: 'is_active' },
    { title: '操作', key: 'actions', sortable: false, align: 'center' },
  ];
  
  const editDialog = reactive({
      show: false,
      loading: false,
      userId: null as number | null,
      username: '',
      role: 'user' as 'admin' | 'manager' | 'user',
      isActive: true,
      error: '',
  });
  
  const deleteDialog = reactive({
      show: false,
      userId: null as number | null,
      username: '',
  });
  
  onMounted(() => {
    adminStore.fetchUsers();
  });
  
  const isMyself = (userId: number) => {
      return authStore.user?.id === userId;
  }
  
  const getRoleColor = (role: string) => {
      if (role === 'admin') return 'error';
      if (role === 'manager') return 'warning';
      return 'primary';
  }
  
  const closeEditDialog = () => {
      editDialog.show = false;
      editDialog.error = '';
  }
  
  const openEditDialog = (user: User) => {
      editDialog.userId = user.id;
      editDialog.username = user.username;
      editDialog.role = user.role;
      editDialog.isActive = user.is_active;
      editDialog.error = '';
      editDialog.show = true;
  }
  
  const handleUpdateUser = async () => {
      if (!editDialog.userId) return;
      editDialog.loading = true;
      editDialog.error = '';
      try {
          await adminStore.updateUser(editDialog.userId, {
              role: editDialog.role,
              is_active: editDialog.isActive,
          });
          editDialog.show = false;
      } catch (e: any) {
          editDialog.error = e.message || '更新失敗';
      } finally {
          editDialog.loading = false;
      }
  }
  
  const openDeleteDialog = (user: User) => {
      deleteDialog.userId = user.id;
      deleteDialog.username = user.username;
      deleteDialog.show = true;
  }
  
  const handleDeleteUser = async () => {
      if (!deleteDialog.userId) return;
      try {
          await adminStore.deleteUser(deleteDialog.userId);
      } catch (e: any) {
          console.error(e);
          // 可以在這裡加入一個 snackbar 提示錯誤
      } finally {
          deleteDialog.show = false;
      }
  }
  </script>