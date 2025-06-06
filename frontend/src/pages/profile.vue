<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- 個人資料卡片 -->
        <v-card class="profile-card" rounded="lg" elevation="2">
          <!-- 卡片標題 -->
          <div class="profile-header">
            <div class="d-flex align-center">
              <v-avatar size="64" color="primary" class="mr-4 elevation-4">
                <v-icon size="32" color="white">mdi-account</v-icon>
              </v-avatar>
              <div>
                <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
                  {{ authStore.user?.username || 'N/A' }}
                </h2>
                <p class="text-body-2 text-grey mb-0">
                  {{ getRoleDisplayName(authStore.user?.role) }}
                </p>
              </div>
            </div>
          </div>

          <v-divider></v-divider>

          <!-- 個人資訊 -->
          <v-card-text class="pa-6">
            <div class="mb-4">
              <h3 class="text-h6 font-weight-medium text-grey-darken-2 mb-4">
                個人資訊
              </h3>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-account-outline</v-icon>
                      <span class="text-body-2 font-weight-medium text-grey-darken-1">使用者名稱</span>
                    </div>
                    <p class="text-body-1 text-grey-darken-3 ml-6">
                      {{ authStore.user?.username || 'N/A' }}
                    </p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-email-outline</v-icon>
                      <span class="text-body-2 font-weight-medium text-grey-darken-1">電子郵件</span>
                    </div>
                    <p class="text-body-1 text-grey-darken-3 ml-6">
                      {{ authStore.user?.email || 'N/A' }}
                    </p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-shield-account-outline</v-icon>
                      <span class="text-body-2 font-weight-medium text-grey-darken-1">角色</span>
                    </div>
                    <p class="text-body-1 text-grey-darken-3 ml-6">
                      {{ getRoleDisplayName(authStore.user?.role) }}
                    </p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <div class="d-flex align-center mb-2">
                      <v-icon 
                        :color="authStore.user?.is_active ? 'success' : 'error'" 
                        class="mr-2"
                      >
                        mdi-circle
                      </v-icon>
                      <span class="text-body-2 font-weight-medium text-grey-darken-1">帳戶狀態</span>
                    </div>
                    <p class="text-body-1 ml-6" :class="authStore.user?.is_active ? 'text-success' : 'text-error'">
                      {{ authStore.user?.is_active ? '啟用中' : '已停用' }}
                    </p>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card-text>

          <!-- 操作按鈕 -->
          <v-card-actions class="pa-6 pt-0">
            <v-spacer></v-spacer>
            <v-btn 
              variant="outlined" 
              color="primary" 
              class="mr-2 text-none"
              @click="usernameDialog.show = true"
            >
              <v-icon start>mdi-account-edit</v-icon>
              修改名稱
            </v-btn>
            <v-btn 
              color="primary" 
              class="text-none"
              @click="passwordDialog.show = true"
            >
              <v-icon start>mdi-lock-reset</v-icon>
              修改密碼
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 修改使用者名稱對話框 -->
    <v-dialog v-model="usernameDialog.show" max-width="400px" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold pa-6 pb-2">
          修改使用者名稱
        </v-card-title>
        
        <v-card-text class="pa-6 pt-2">
          <v-text-field
            label="新的使用者名稱"
            v-model="usernameDialog.newUsername"
            variant="outlined"
            prepend-inner-icon="mdi-account-outline"
            :error-messages="usernameDialog.error ? [usernameDialog.error] : []"
            :disabled="usernameDialog.loading"
            color="primary"
            autofocus
          ></v-text-field>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="text" 
            @click="closeUsernameDialog"
            :disabled="usernameDialog.loading"
            class="text-none"
          >
            取消
          </v-btn>
          <v-btn 
            color="primary" 
            @click="handleUpdateUsername" 
            :loading="usernameDialog.loading"
            class="text-none"
          >
            確認更新
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 修改密碼對話框 -->
    <v-dialog v-model="passwordDialog.show" max-width="400px" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold pa-6 pb-2">
          修改密碼
        </v-card-title>
        
        <v-card-text class="pa-6 pt-2">
          <v-form @submit.prevent="handleUpdatePassword">
            <v-text-field
              label="目前密碼"
              v-model="passwordDialog.currentPassword"
              variant="outlined"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showCurrentPassword ? 'text' : 'password'"
              class="mb-4"
              :disabled="passwordDialog.loading"
              color="primary"
              @click:append-inner="showCurrentPassword = !showCurrentPassword"
            ></v-text-field>
            
            <v-text-field
              label="新密碼"
              v-model="passwordDialog.newPassword"
              variant="outlined"
              prepend-inner-icon="mdi-lock-plus-outline"
              :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showNewPassword ? 'text' : 'password'"
              class="mb-4"
              :disabled="passwordDialog.loading"
              color="primary"
              @click:append-inner="showNewPassword = !showNewPassword"
            ></v-text-field>
            
            <v-text-field
              label="確認新密碼"
              v-model="passwordDialog.confirmPassword"
              variant="outlined"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showConfirmPassword ? 'text' : 'password'"
              :error-messages="passwordDialog.error ? [passwordDialog.error] : []"
              :disabled="passwordDialog.loading"
              color="primary"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
            ></v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="text" 
            @click="closePasswordDialog"
            :disabled="passwordDialog.loading"
            class="text-none"
          >
            取消
          </v-btn>
          <v-btn 
            color="primary" 
            @click="handleUpdatePassword" 
            :loading="passwordDialog.loading"
            class="text-none"
          >
            確認更新
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
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

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

// 獲取角色顯示名稱
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin':
      return '系統管理員';
    case 'manager':
      return '管理者';
    case 'user':
    default:
      return '一般使用者';
  }
};

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
  showCurrentPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
}

async function handleUpdateUsername() {
  if (!usernameDialog.newUsername.trim()) {
    usernameDialog.error = '使用者名稱不可為空';
    return;
  }
  
  if (usernameDialog.newUsername.trim().length < 3) {
    usernameDialog.error = '使用者名稱至少需要3個字元';
    return;
  }
  
  usernameDialog.loading = true;
  usernameDialog.error = '';
  try {
    await authStore.updateMyUsername(usernameDialog.newUsername.trim());
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
  if (!passwordDialog.currentPassword) {
    passwordDialog.error = '請輸入目前密碼';
    return;
  }
  
  if (!passwordDialog.newPassword) {
    passwordDialog.error = '請輸入新密碼';
    return;
  }
  
  if (passwordDialog.newPassword.length < 6) {
    passwordDialog.error = '新密碼至少需要6個字元';
    return;
  }
  
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

<style scoped>
/* 個人資料卡片樣式 */
.profile-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.profile-header {
  padding: 32px 32px 24px 32px;
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
}

/* 資訊項目樣式 */
.info-item {
  padding: 16px;
  border-radius: 8px;
  background: rgba(25, 118, 210, 0.02);
  border: 1px solid rgba(25, 118, 210, 0.1);
  transition: all 0.2s ease;
}

.info-item:hover {
  background: rgba(25, 118, 210, 0.04);
  border-color: rgba(25, 118, 210, 0.2);
}

/* 對話框樣式 */
.v-dialog .v-card {
  background: white;
}

/* 響應式設計 */
@media (max-width: 600px) {
  .profile-header {
    padding: 24px 20px 20px 20px;
  }
  
  .v-card-text {
    padding: 20px !important;
  }
  
  .v-card-actions {
    padding: 20px !important;
    padding-top: 0 !important;
  }
  
  .info-item {
    padding: 12px;
  }
  
  .text-h5 {
    font-size: 1.25rem !important;
  }
}
</style>