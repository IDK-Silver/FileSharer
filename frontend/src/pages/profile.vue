<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5">個人資料</v-card-title>
          <v-divider></v-divider>
          <v-list lines="two">
            <v-list-item
              title="使用者名稱"
              :subtitle="authStore.user?.username || 'N/A'"
            >
              <template v-slot:prepend>
                <v-icon>mdi-account</v-icon>
              </template>
            </v-list-item>

            <v-list-item
              title="電子郵件"
              :subtitle="authStore.user?.email || 'N/A'"
            >
              <template v-slot:prepend>
                <v-icon>mdi-email</v-icon>
              </template>
            </v-list-item>

            <v-list-item
              title="角色"
              :subtitle="authStore.user?.role || 'N/A'"
            >
              <template v-slot:prepend>
                <v-icon>mdi-shield-account</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              title="帳戶狀態"
              :subtitle="authStore.user?.is_active ? '啟用中' : '已停用'"
            >
              <template v-slot:prepend>
                <v-icon :color="authStore.user?.is_active ? 'success' : 'error'">mdi-circle</v-icon>
              </template>
            </v-list-item>
          </v-list>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="usernameDialog.show = true">修改使用者名稱</v-btn>
            <v-btn color="secondary" @click="passwordDialog.show = true">修改密碼</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 修改使用者名稱對話框 -->
    <v-dialog v-model="usernameDialog.show" max-width="400px" persistent>
      <v-card>
        <v-card-title>修改使用者名稱</v-card-title>
        <v-card-text>
          <v-text-field
            label="新的使用者名稱"
            v-model="usernameDialog.newUsername"
            :error-messages="usernameDialog.error ? [usernameDialog.error] : []"
            autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeUsernameDialog">取消</v-btn>
          <v-btn color="primary" text @click="handleUpdateUsername" :loading="usernameDialog.loading">確認</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 修改密碼對話框 -->
    <v-dialog v-model="passwordDialog.show" max-width="400px" persistent>
        <v-card>
            <v-card-title>修改密碼</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="handleUpdatePassword">
                    <v-text-field
                        label="目前密碼"
                        v-model="passwordDialog.currentPassword"
                        type="password"
                        class="mb-2"
                    ></v-text-field>
                    <v-text-field
                        label="新密碼"
                        v-model="passwordDialog.newPassword"
                        type="password"
                        class="mb-2"
                    ></v-text-field>
                    <v-text-field
                        label="確認新密碼"
                        v-model="passwordDialog.confirmPassword"
                        type="password"
                        :error-messages="passwordDialog.error ? [passwordDialog.error] : []"
                    ></v-text-field>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="closePasswordDialog">取消</v-btn>
                <v-btn color="primary" text @click="handleUpdatePassword" :loading="passwordDialog.loading">確認更新</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- 通知 Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.text }}</v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const snackbar = reactive({ show: false, text: '', color: 'success' });

const usernameDialog = reactive({
  show: false,
  newUsername: '',
  loading: false,
  error: '',
});

const passwordDialog = reactive({
  show: false,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  loading: false,
  error: '',
});

function closeUsernameDialog() {
  usernameDialog.show = false;
  usernameDialog.error = '';
  usernameDialog.newUsername = '';
}

function closePasswordDialog() {
    passwordDialog.show = false;
    passwordDialog.error = '';
    passwordDialog.currentPassword = '';
    passwordDialog.newPassword = '';
    passwordDialog.confirmPassword = '';
}

async function handleUpdateUsername() {
  if (!usernameDialog.newUsername) {
    usernameDialog.error = '使用者名稱不可為空';
    return;
  }
  usernameDialog.loading = true;
  usernameDialog.error = '';
  try {
    await authStore.updateMyUsername(usernameDialog.newUsername);
    snackbar.text = '使用者名稱更新成功！';
    snackbar.color = 'success';
    snackbar.show = true;
    closeUsernameDialog();
  } catch (e: any) {
    usernameDialog.error = e.message || '更新失敗';
  } finally {
    usernameDialog.loading = false;
  }
}

async function handleUpdatePassword() {
    if (passwordDialog.newPassword !== passwordDialog.confirmPassword) {
        passwordDialog.error = '新密碼與確認密碼不符';
        return;
    }
    passwordDialog.loading = true;
    passwordDialog.error = '';
    try {
        await authStore.updateMyPassword({
            current_password: passwordDialog.currentPassword,
            new_password: passwordDialog.newPassword,
            confirm_password: passwordDialog.confirmPassword,
        });
        snackbar.text = '密碼更新成功！';
        snackbar.color = 'success';
        snackbar.show = true;
        closePasswordDialog();
    } catch (e: any) {
        passwordDialog.error = e.message || '更新失敗';
    } finally {
        passwordDialog.loading = false;
    }
}
</script>