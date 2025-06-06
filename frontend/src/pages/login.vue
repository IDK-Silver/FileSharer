<template>
    <v-row justify="center" align="center" style="height: 100%;">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>登入您的帳戶</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="使用者名稱或電子郵件"
                name="username"
                prepend-icon="mdi-account"
                type="text"
                required
                :rules="[v => !!v || '使用者名稱為必填']"
                :disabled="authStore.loginLoading"
              ></v-text-field>
  
              <v-text-field
                v-model="password"
                label="密碼"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                required
                :rules="[v => !!v || '密碼為必填']"
                :disabled="authStore.loginLoading"
              ></v-text-field>
  
              <v-alert v-if="authStore.error" type="error" dense class="mb-4">
                {{ authStore.error }}
              </v-alert>
  
              <v-btn type="submit" color="primary" block :loading="authStore.loginLoading">登入</v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <router-link to="/register">還沒有帳戶嗎？ 點此註冊</router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
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
  // const errorMessage = ref<string | null>(null); // 由 store 管理
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  const handleLogin = async () => {
    if (!username.value || !password.value) {
      // 可以選擇在這裡也做一次前端驗證提示，或者完全依賴 Vuetify 的 rules
      // authStore.error = '請輸入使用者名稱和密碼。'; // 不建議直接修改 store error，應由 action 結果觸發
      return;
    }
  
    const success = await authStore.login({ username: username.value, password: password.value });
    if (success) {
      router.push('/'); // 登入成功後跳轉到儀表板
    }
    // 錯誤訊息會由 store.error 自動更新並顯示在 v-alert
  };
  </script>
  
  <style scoped>
  .v-card {
    max-width: 400px;
    margin: auto;
  }
  </style>