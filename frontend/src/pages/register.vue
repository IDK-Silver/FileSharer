<template>
  <div class="register-container">
    <v-container fluid class="fill-height">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4" xl="3">
          <v-card class="register-card" rounded="lg" elevation="4">
            <!-- 品牌標題區域 -->
            <div class="brand-header">
              <div class="d-flex align-center justify-center mb-4">
                <v-icon icon="mdi-cloud" size="32" color="primary" class="mr-3"></v-icon>
                <h1 class="text-h4 font-weight-bold text-primary">FileSharer</h1>
              </div>
              <p class="text-subtitle-1 text-grey text-center">安全 • 快速 • 可靠</p>
            </div>

            <!-- 註冊表單區域 -->
            <v-card-text class="pa-8">
              <div class="text-center mb-6">
                <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-2">
                  建立新帳戶
                </h2>
                <p class="text-body-2 text-grey">填寫以下資訊完成註冊</p>
              </div>

              <v-form @submit.prevent="handleRegister" ref="registerForm">
                <v-text-field
                  v-model="email"
                  label="電子郵件"
                  variant="outlined"
                  prepend-inner-icon="mdi-email-outline"
                  type="email"
                  class="mb-4"
                  :rules="[
                    v => !!v || '電子郵件為必填',
                    v => /.+@.+\..+/.test(v) || '電子郵件格式不正確'
                  ]"
                  :disabled="authStore.registerLoading"
                  color="primary"
                ></v-text-field>

                <v-text-field
                  v-model="username"
                  label="使用者名稱"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-outline"
                  class="mb-4"
                  :rules="[
                    v => !!v || '使用者名稱為必填',
                    v => (v && v.length >= 3) || '使用者名稱至少需要3個字元'
                  ]"
                  :disabled="authStore.registerLoading"
                  color="primary"
                ></v-text-field>

                <v-text-field
                  v-model="password"
                  label="密碼"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  class="mb-4"
                  :rules="[
                    v => !!v || '密碼為必填',
                    v => (v && v.length >= 6) || '密碼至少需要6個字元'
                  ]"
                  :disabled="authStore.registerLoading"
                  color="primary"
                  @click:append-inner="showPassword = !showPassword"
                ></v-text-field>

                <v-text-field
                  v-model="confirmPassword"
                  label="確認密碼"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="mb-4"
                  :rules="[
                    v => !!v || '確認密碼為必填',
                    v => v === password || '兩次輸入的密碼不一致'
                  ]"
                  :disabled="authStore.registerLoading"
                  color="primary"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                ></v-text-field>

                <!-- 錯誤提示 -->
                <v-alert 
                  v-if="authStore.error && !successMessage" 
                  type="error" 
                  variant="tonal"
                  class="mb-4"
                >
                  {{ authStore.error }}
                </v-alert>

                <!-- 成功提示 -->
                <v-alert 
                  v-if="successMessage" 
                  type="success" 
                  variant="tonal"
                  class="mb-4"
                >
                  {{ successMessage }}
                </v-alert>

                <!-- 註冊按鈕 -->
                <v-btn 
                  type="submit" 
                  color="primary" 
                  size="large"
                  block 
                  :loading="authStore.registerLoading"
                  class="mb-4 text-none font-weight-medium"
                >
                  <v-icon start icon="mdi-account-plus"></v-icon>
                  建立帳戶
                </v-btn>

                <!-- 分隔線 -->
                <div class="divider-container mb-4">
                  <v-divider></v-divider>
                  <span class="divider-text text-caption text-grey">或</span>
                  <v-divider></v-divider>
                </div>

                <!-- 登入連結 -->
                <div class="text-center">
                  <p class="text-body-2 text-grey mb-2">已經有帳戶了嗎？</p>
                  <v-btn
                    :to="'/login'"
                    variant="outlined"
                    color="primary"
                    class="text-none"
                  >
                    <v-icon start icon="mdi-login"></v-icon>
                    立即登入
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

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const successMessage = ref<string | null>(null);
const registerForm = ref();

const router = useRouter();
const authStore = useAuthStore();

const handleRegister = async () => {
  // 表單驗證
  const { valid } = await registerForm.value.validate();
  if (!valid) return;

  // 清除之前的成功訊息
  successMessage.value = null;

  const success = await authStore.register({
    email: email.value,
    username: username.value,
    password: password.value,
  });

  if (success) {
    successMessage.value = '註冊成功！將跳轉至登入頁面...';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  }
};
</script>

<style scoped>
/* 主容器樣式 */
.register-container {
  min-height: calc(100vh - 112px); /* 扣除應用欄和頁尾高度 */
  background-color: #f5f5f5;
  padding: 40px 0;
}

/* 註冊卡片樣式 */
.register-card {
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
  .register-container {
    padding: 20px 0;
  }
  
  .brand-header {
    padding: 24px 24px 16px 24px;
  }
  
  .register-card .v-card-text {
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
  
  .register-card .v-card-text {
    padding: 20px !important;
  }
}
</style>