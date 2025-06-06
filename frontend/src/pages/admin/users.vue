<template>
  <v-container fluid>
    <h1 class="text-h4 mb-4">使用者管理</h1>

    <v-card>
      <v-card-title>
        <div class="d-flex align-center">
          使用者列表
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openCreateDialog">新增使用者</v-btn>
          <v-btn
            icon="mdi-refresh"
            variant="text"
            @click="adminStore.fetchUsers"
            :loading="adminStore.isLoading"
          ></v-btn>
        </div>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="adminStore.users"
        :loading="adminStore.isLoading"
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
            <v-btn icon="mdi-lock-reset" variant="text" @click="openResetPasswordDialog(item)" :disabled="isMyself(item.id)">
              <v-icon>mdi-lock-reset</v-icon>
              <v-tooltip activator="parent" location="top">重設密碼</v-tooltip>
            </v-btn>
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

    <!-- 新增使用者對話框 -->
    <v-dialog v-model="createDialog.show" max-width="500px" persistent>
      <v-card :loading="createDialog.loading">
        <v-card-title>新增使用者</v-card-title>
        <v-card-text>
            <v-text-field label="Email" v-model="createDialog.email" class="mb-2"></v-text-field>
            <v-text-field label="使用者名稱" v-model="createDialog.username" class="mb-2"></v-text-field>
            <v-text-field label="密碼" v-model="createDialog.password" type="password" class="mb-2"></v-text-field>
            <v-select label="角色" v-model="createDialog.role" :items="['user', 'manager', 'admin']" class="mb-2"></v-select>
            <v-switch label="立即啟用" v-model="createDialog.isActive" color="primary"></v-switch>
            <v-alert v-if="createDialog.error" type="error" dense>{{ createDialog.error }}</v-alert>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeCreateDialog">取消</v-btn>
            <v-btn color="primary" text @click="handleCreateUser">建立</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 重設密碼對話框 -->
    <v-dialog v-model="resetPasswordDialog.show" max-width="400px" persistent>
        <v-card :loading="resetPasswordDialog.loading">
            <v-card-title>重設密碼 for {{ resetPasswordDialog.username }}</v-card-title>
            <v-card-text>
                <v-text-field label="新密碼" v-model="resetPasswordDialog.newPassword" type="password"></v-text-field>
                <v-alert v-if="resetPasswordDialog.error" type="error" dense>{{ resetPasswordDialog.error }}</v-alert>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="closeResetPasswordDialog">取消</v-btn>
                <v-btn color="primary" text @click="handleResetPassword">確認重設</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- 編輯使用者對話框 -->
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

    <!-- 確認刪除對話框 -->
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
    } catch (e: any) {
        console.error(e);
        // 可以在這裡加入一個 snackbar 提示錯誤
    } finally {
        deleteDialog.show = false;
    }
}
</script>