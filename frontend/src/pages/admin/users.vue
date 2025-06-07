<template>
  <v-container fluid class="pa-6">
    <!-- 頁面標題 -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">使用者管理</h1>
        <p class="text-body-2 text-grey mt-1">管理系統中的所有使用者</p>
      </div>
      <v-spacer></v-spacer>
      <v-chip variant="outlined" color="primary" class="mr-2">
        <v-icon start>mdi-account-group</v-icon>
        總計 {{ adminStore.users.length }} 位使用者
      </v-chip>
    </div>

    <!-- 主要卡片 -->
    <v-card rounded="lg" elevation="2" class="users-card">
      <!-- 卡片標題和操作 -->
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center w-100">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-database-account</v-icon>
            <span class="text-h6 font-weight-medium">使用者列表</span>
          </div>
          
          <v-spacer></v-spacer>
          
          <!-- 操作按鈕 -->
          <div class="d-flex align-center">
            <v-btn 
              color="primary" 
              variant="elevated"
              class="mr-2 text-none"
              @click="openCreateDialog"
            >
              <v-icon start>mdi-account-plus</v-icon>
              新增使用者
            </v-btn>
            <v-btn 
              icon
              variant="text"
              @click="adminStore.fetchUsers"
              :loading="adminStore.isLoadingUsers"
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
        :items="adminStore.users"
        :loading="adminStore.isLoadingUsers"
        item-value="id"
        class="users-table"
        :items-per-page="15"
        :loading-text="'載入使用者資料中...'"
        :no-data-text="'沒有找到使用者資料'"
      >
        <!-- 使用者名稱欄位 -->
        <template v-slot:item.username="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary" class="mr-3">
              <v-icon color="white" size="16">mdi-account</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.username }}</div>
              <div class="text-caption text-grey">ID: {{ item.id }}</div>
            </div>
          </div>
        </template>

        <!-- 角色欄位 -->
        <template v-slot:item.role="{ item }">
          <v-chip :color="getRoleColor(item.role)" size="small" variant="outlined">
            <v-icon start size="14">{{ getRoleIcon(item.role) }}</v-icon>
            {{ getRoleDisplayName(item.role) }}
          </v-chip>
        </template>

        <!-- 狀態欄位 -->
        <template v-slot:item.is_active="{ item }">
          <v-chip 
            :color="item.is_active ? 'success' : 'error'" 
            size="small" 
            variant="tonal"
          >
            <v-icon start size="14">
              {{ item.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
            {{ item.is_active ? '啟用' : '停用' }}
          </v-chip>
        </template>
        
        <!-- 操作欄位 -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center">
            <v-btn 
              icon 
              variant="text" 
              color="warning"
              size="small"
              @click="openResetPasswordDialog(item)" 
              :disabled="isMyself(item.id)"
            >
              <v-icon>mdi-lock-reset</v-icon>
              <v-tooltip activator="parent" location="top">重設密碼</v-tooltip>
            </v-btn>
            <v-btn 
              icon 
              variant="text" 
              color="info"
              size="small"
              @click="openEditDialog(item)" 
              :disabled="isMyself(item.id)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">編輯</v-tooltip>
            </v-btn>
            <v-btn 
              icon 
              variant="text" 
              color="error"
              size="small"
              @click="openDeleteDialog(item)" 
              :disabled="isMyself(item.id)"
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

    <!-- 新增使用者對話框 -->
    <v-dialog v-model="createDialog.show" max-width="500px" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-6 pb-4 bg-primary text-white">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-plus</v-icon>
            <span class="text-h6 font-weight-bold">新增使用者</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form>
            <v-text-field
              label="電子郵件"
              v-model="createDialog.email"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              class="mb-4"
              :disabled="createDialog.loading"
              color="primary"
            ></v-text-field>
            
            <v-text-field
              label="使用者名稱"
              v-model="createDialog.username"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              class="mb-4"
              :disabled="createDialog.loading"
              color="primary"
            ></v-text-field>
            
            <v-text-field
              label="密碼"
              v-model="createDialog.password"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              type="password"
              class="mb-4"
              :disabled="createDialog.loading"
              color="primary"
            ></v-text-field>
            
            <v-select
              label="角色"
              v-model="createDialog.role"
              :items="roleOptions"
              variant="outlined"
              prepend-inner-icon="mdi-shield-account"
              class="mb-4"
              :disabled="createDialog.loading"
              color="primary"
            ></v-select>
            
            <v-switch
              label="立即啟用帳戶"
              v-model="createDialog.isActive"
              color="primary"
              :disabled="createDialog.loading"
              hide-details
            ></v-switch>
            
            <v-alert v-if="createDialog.error" type="error" class="mt-4" variant="tonal">
              {{ createDialog.error }}
            </v-alert>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="outlined" 
            @click="closeCreateDialog"
            :disabled="createDialog.loading"
            class="text-none"
          >
            取消
          </v-btn>
          <v-btn 
            color="primary" 
            @click="handleCreateUser"
            :loading="createDialog.loading"
            class="text-none"
          >
            建立使用者
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 重設密碼對話框 -->
    <v-dialog v-model="resetPasswordDialog.show" max-width="450px" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-6 pb-4 bg-warning text-white">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-lock-reset</v-icon>
            <span class="text-h6 font-weight-bold">重設密碼</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="mb-4">
            <p class="text-body-1 mb-3">為使用者重設新密碼：</p>
            <v-card variant="outlined" class="pa-3">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="mr-3">
                  <v-icon color="white" size="16">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ resetPasswordDialog.username }}</div>
                  <div class="text-caption text-grey">使用者</div>
                </div>
              </div>
            </v-card>
          </div>
          
          <v-text-field
            label="新密碼"
            v-model="resetPasswordDialog.newPassword"
            variant="outlined"
            prepend-inner-icon="mdi-lock-plus"
            type="password"
            :disabled="resetPasswordDialog.loading"
            color="primary"
          ></v-text-field>
          
          <v-alert v-if="resetPasswordDialog.error" type="error" class="mt-4" variant="tonal">
            {{ resetPasswordDialog.error }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="outlined" 
            @click="closeResetPasswordDialog"
            :disabled="resetPasswordDialog.loading"
            class="text-none"
          >
            取消
          </v-btn>
          <v-btn 
            color="warning" 
            @click="handleResetPassword"
            :loading="resetPasswordDialog.loading"
            class="text-none"
          >
            確認重設
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 編輯使用者對話框 -->
    <v-dialog v-model="editDialog.show" max-width="500px" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-6 pb-4 bg-info text-white">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-edit</v-icon>
            <span class="text-h6 font-weight-bold">編輯使用者</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="mb-4">
            <v-card variant="outlined" class="pa-3">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="mr-3">
                  <v-icon color="white" size="16">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ editDialog.username }}</div>
                  <div class="text-caption text-grey">編輯中的使用者</div>
                </div>
              </div>
            </v-card>
          </div>
          
          <v-select
            v-model="editDialog.role"
            :items="roleOptions"
            label="角色"
            variant="outlined"
            prepend-inner-icon="mdi-shield-account"
            class="mb-4"
            :disabled="editDialog.loading"
            color="primary"
          ></v-select>
          
          <v-switch
            v-model="editDialog.isActive"
            :label="`帳戶狀態: ${editDialog.isActive ? '啟用' : '停用'}`"
            color="primary"
            :disabled="editDialog.loading"
            hide-details
          ></v-switch>
          
          <v-alert v-if="editDialog.error" type="error" class="mt-4" variant="tonal">
            {{ editDialog.error }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="outlined" 
            @click="closeEditDialog"
            :disabled="editDialog.loading"
            class="text-none"
          >
            取消
          </v-btn>
          <v-btn 
            color="info" 
            @click="handleUpdateUser"
            :loading="editDialog.loading"
            class="text-none"
          >
            儲存變更
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <v-dialog v-model="deleteDialog.show" max-width="450px" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-6 pb-4 bg-error text-white">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-alert-circle</v-icon>
            <span class="text-h6 font-weight-bold">確認刪除使用者</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="mb-4">
            <p class="text-body-1 mb-3">您確定要刪除以下使用者嗎？</p>
            <v-card variant="outlined" class="pa-3">
              <div class="d-flex align-center">
                <v-avatar size="32" color="error" class="mr-3">
                  <v-icon color="white" size="16">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ deleteDialog.username }}</div>
                  <div class="text-caption text-grey">將被刪除的使用者</div>
                </div>
              </div>
            </v-card>
          </div>
          
          <v-alert type="warning" variant="tonal" class="mb-0">
            <v-icon>mdi-information</v-icon>
            此操作無法復原，使用者的所有資料將被永久刪除
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="outlined" 
            @click="deleteDialog.show = false"
            class="text-none"
          >
            取消
          </v-btn>
          <v-btn 
            color="error" 
            variant="elevated"
            @click="handleDeleteUser"
            class="text-none"
          >
            <v-icon start>mdi-delete</v-icon>
            確認刪除
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
import { ref, onMounted, reactive, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/stores/auth';

const adminStore = useAdminStore();
const authStore = useAuthStore();

const snackbar = reactive({ show: false, text: '', color: 'success' });

// 修正 headers 類型定義
const headers = [
  { title: 'ID', key: 'id', align: 'start' as const, width: '80px' },
  { title: '使用者名稱', key: 'username' },
  { title: '電子郵件', key: 'email' },
  { title: '角色', key: 'role' },
  { title: '狀態', key: 'is_active' },
  { title: '操作', key: 'actions', sortable: false, align: 'center' as const },
] as const;

// 角色選項
const roleOptions = [
  { title: '系統管理員', value: 'admin' },
  { title: '管理者', value: 'manager' },
  { title: '一般使用者', value: 'user' },
];

// 新增使用者對話框狀態
const createDialog = reactive({
    show: false,
    loading: false,
    email: '',
    username: '',
    password: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    isActive: true,
    error: '',
});

// 重設密碼對話框狀態
const resetPasswordDialog = reactive({
    show: false,
    loading: false,
    userId: null as number | null,
    username: '',
    newPassword: '',
    error: '',
});

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

const getRoleIcon = (role: string) => {
    if (role === 'admin') return 'mdi-shield-crown';
    if (role === 'manager') return 'mdi-shield-account';
    return 'mdi-account';
}

const getRoleDisplayName = (role: string) => {
    if (role === 'admin') return '系統管理員';
    if (role === 'manager') return '管理者';
    return '一般使用者';
}

// 新增使用者相關函式
const closeCreateDialog = () => {
    createDialog.show = false;
    createDialog.loading = false;
    createDialog.error = '';
    createDialog.email = '';
    createDialog.username = '';
    createDialog.password = '';
    createDialog.role = 'user';
    createDialog.isActive = true;
};

const openCreateDialog = () => {
    closeCreateDialog(); // 先重設
    createDialog.show = true;
};

const handleCreateUser = async () => {
    if (!createDialog.email || !createDialog.username || !createDialog.password) {
        createDialog.error = '請填寫所有必填欄位';
        return;
    }
    
    createDialog.loading = true;
    createDialog.error = '';
    try {
        await adminStore.createUser({
            email: createDialog.email,
            username: createDialog.username,
            password: createDialog.password,
            role: createDialog.role,
            is_active: createDialog.isActive,
        });
        closeCreateDialog();
        snackbar.text = '使用者建立成功';
        snackbar.color = 'success';
        snackbar.show = true;
    } catch (e: any) {
        createDialog.error = e.message || '建立失敗';
    } finally {
        createDialog.loading = false;
    }
};

// 重設密碼相關函式
const closeResetPasswordDialog = () => {
    resetPasswordDialog.show = false;
    resetPasswordDialog.loading = false;
    resetPasswordDialog.error = '';
    resetPasswordDialog.newPassword = '';
};

const openResetPasswordDialog = (user: User) => {
    closeResetPasswordDialog();
    resetPasswordDialog.userId = user.id;
    resetPasswordDialog.username = user.username;
    resetPasswordDialog.show = true;
};

const handleResetPassword = async () => {
    if (!resetPasswordDialog.userId || !resetPasswordDialog.newPassword) {
        resetPasswordDialog.error = '新密碼不可為空';
        return;
    }
    resetPasswordDialog.loading = true;
    resetPasswordDialog.error = '';
    try {
        await adminStore.resetUserPassword(resetPasswordDialog.userId, resetPasswordDialog.newPassword);
        closeResetPasswordDialog();
        snackbar.text = '密碼重設成功';
        snackbar.color = 'success';
        snackbar.show = true;
    } catch (e: any) {
        resetPasswordDialog.error = e.message || '重設密碼失敗';
    } finally {
        resetPasswordDialog.loading = false;
    }
};

// 編輯使用者相關函式
const closeEditDialog = () => {
    editDialog.show = false;
    editDialog.loading = false;
    editDialog.error = '';
}

const openEditDialog = (user: User) => {
    closeEditDialog();
    editDialog.userId = user.id;
    editDialog.username = user.username;
    editDialog.role = user.role;
    editDialog.isActive = user.is_active;
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
        closeEditDialog();
        snackbar.text = '使用者資訊更新成功';
        snackbar.color = 'success';
        snackbar.show = true;
    } catch (e: any) {
        editDialog.error = e.message || '更新失敗';
    } finally {
        editDialog.loading = false;
    }
}

// 刪除使用者相關函式
const openDeleteDialog = (user: User) => {
    deleteDialog.userId = user.id;
    deleteDialog.username = user.username;
    deleteDialog.show = true;
}

const handleDeleteUser = async () => {
    if (!deleteDialog.userId) return;
    try {
        await adminStore.deleteUser(deleteDialog.userId);
        snackbar.text = '使用者刪除成功';
        snackbar.color = 'success';
        snackbar.show = true;
    } catch (e: any) {
        console.error(e);
        snackbar.text = '刪除失敗';
        snackbar.color = 'error';
        snackbar.show = true;
    } finally {
        deleteDialog.show = false;
    }
}
</script>

<style scoped>
/* 主要卡片樣式 */
.users-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* 表格樣式 */
.users-table :deep(.v-data-table__td) {
  padding: 12px 16px;
}

.users-table :deep(.v-data-table__th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #424242;
}

.users-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(25, 118, 210, 0.04) !important;
}

/* 響應式設計 */
@media (max-width: 960px) {
  .v-container {
    padding: 16px !important;
  }
  
  .users-table :deep(.v-data-table__td),
  .users-table :deep(.v-data-table__th) {
    padding: 8px 12px;
    font-size: 0.875rem;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .v-card-title {
    padding: 16px !important;
  }
}
</style>