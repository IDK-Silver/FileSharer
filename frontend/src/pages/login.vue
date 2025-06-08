<template>
  <div class="login-container">
    <v-container fluid class="fill-height">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4" xl="3">
          <v-card class="login-card" rounded="lg" elevation="4">
            <!-- 品牌標題區域 -->
            <div class="brand-header">
              <div class="d-flex align-center justify-center mb-4">
                <v-icon icon="mdi-cloud" size="32" color="primary" class="mr-3"></v-icon>
                <h1 class="text-h4 font-weight-bold text-primary">File Sharer</h1>
              </div>
              <p class="text-subtitle-1 text-grey text-center">安全 • 快速 • 可靠</p>

              <h3 class="text-h8 font-weight-medium text-primary ml-2">S11159005 黃毓峰</h3>
            </div>

            <!-- 登入表單區域 -->
            <v-card-text class="pa-8">
              <div class="text-center mb-6">
                <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-2">
                  歡迎回來
                </h2>
                <p class="text-body-2 text-grey">請登入您的帳戶以繼續</p>
              </div>

              <v-form @submit.prevent="handleLogin" ref="loginForm">
                <v-text-field v-model="username" label="使用者名稱" variant="outlined"
                  prepend-inner-icon="mdi-account-outline" class="mb-4" :rules="[v => !!v || '請輸入使用者名稱或電子郵件']"
                  :disabled="authStore.loginLoading" color="primary"></v-text-field>

                <v-text-field v-model="password" label="密碼" variant="outlined" prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'" class="mb-4" :rules="[v => !!v || '請輸入密碼']"
                  :disabled="authStore.loginLoading" color="primary"
                  @click:append-inner="showPassword = !showPassword"></v-text-field>

                <!-- 錯誤提示 -->
                <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4">
                  {{ authStore.error }}
                </v-alert>

                <!-- 登入按鈕 -->
                <v-btn type="submit" color="primary" size="large" block :loading="authStore.loginLoading"
                  class="mb-4 text-none font-weight-medium">
                  <v-icon start icon="mdi-login"></v-icon>
                  登入
                </v-btn>

                <!-- 分隔線 -->
                <div class="divider-container mb-4">
                  <v-divider></v-divider>
                  <span class="divider-text text-caption text-grey">或</span>
                  <v-divider></v-divider>
                </div>

                <!-- 註冊連結 -->
                <div class="text-center">
                  <p class="text-body-2 text-grey mb-2">還沒有帳戶？</p>
                  <v-btn :to="'/register'" variant="outlined" color="primary" class="text-none">
                    <v-icon start icon="mdi-account-plus"></v-icon>
                    建立新帳戶
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<route lang="yaml">
meta:
  layout: public
</route>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const loginForm = ref();

const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  // 表單驗證
  const { valid } = await loginForm.value.validate();
  if (!valid) return;

  const success = await authStore.login({ 
    username: username.value, 
    password: password.value 
  });
  
  if (success) {
    router.push('/');
  }
};
</script>

<style scoped>
/* 主容器樣式 */
.login-container {
  min-height: calc(100vh - 112px); /* 扣除應用欄和頁尾高度 */
  background-color: #f5f5f5;
  padding: 40px 0;
}

/* 登入卡片樣式 */
.login-card {
  background: white;
  max-width: 400px;
  margin: 0 auto;
}

/* 品牌標題區域 */
.brand-header {
  padding: 32px 32px 16px 32px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

/* 分隔線樣式 */
.divider-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.divider-text {
  background: white;
  padding: 0 12px;
  white-space: nowrap;
}

/* 響應式設計 */
@media (max-width: 600px) {
  .login-container {
    padding: 20px 0;
  }
  
  .brand-header {
    padding: 24px 24px 16px 24px;
  }
  
  .login-card .v-card-text {
    padding: 24px !important;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}

@media (max-width: 400px) {
  .brand-header {
    padding: 20px 20px 12px 20px;
  }
  
  .login-card .v-card-text {
    padding: 20px !important;
  }
}
</style>