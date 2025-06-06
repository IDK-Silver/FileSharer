
<template>
    <v-row justify="center" align="center" style="height: 100%;">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>建立新帳戶</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="email"
                label="電子郵件"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                required
                :rules="[v => !!v || '電子郵件為必填', v => /.+@.+\..+/.test(v) || '電子郵件格式不正確']"
                :disabled="authStore.registerLoading"
              ></v-text-field>
  
              <v-text-field
                v-model="username"
                label="使用者名稱"
                name="username"
                prepend-icon="mdi-account"
                type="text"
                required
                :rules="[v => !!v || '使用者名稱為必填', v => (v && v.length >= 3) || '使用者名稱至少需要3個字元']"
                :disabled="authStore.registerLoading"
              ></v-text-field>
  
              <v-text-field
                v-model="password"
                label="密碼"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                required
                :rules="[v => !!v || '密碼為必填', v => (v && v.length >= 6) || '密碼至少需要6個字元']"
                :disabled="authStore.registerLoading"
              ></v-text-field>
  
              <v-text-field
                v-model="confirmPassword"
                label="確認密碼"
                name="confirmPassword"
                prepend-icon="mdi-lock-check"
                type="password"
                required
                :rules="[v => !!v || '確認密碼為必填', v => v === password || '兩次輸入的密碼不一致']"
                :disabled="authStore.registerLoading"
              ></v-text-field>
  
              <v-alert v-if="authStore.error && !successMessage" type="error" dense class="mb-4">
                {{ authStore.error }}
              </v-alert>
              <v-alert v-if="successMessage" type="success" dense class="mb-4">
                {{ successMessage }}
              </v-alert>
  
              <v-btn type="submit" color="primary" block :loading="authStore.registerLoading">註冊</v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <router-link to="/login">已經有帳戶了嗎？ 點此登入</router-link>
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
  
  const email = ref('');
  const username = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const successMessage = ref<string | null>(null);
  // errorMessage 由 store 管理
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  const handleRegister = async () => {
    if (password.value !== confirmPassword.value) {
      // authStore.error = '兩次輸入的密碼不一致。'; // 最好由 store action 內部設定
      return;
    }
    if (!email.value || !username.value || !password.value) {
      // authStore.error = '所有欄位皆為必填。';
      return;
    }
    successMessage.value = null; // 清除之前的成功訊息
  
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
    // 錯誤訊息會由 store.error 自動更新並顯示在 v-alert
  };
  </script>
  
  <style scoped>
  .v-card {
    max-width: 450px;
    margin: auto;
  }
  </style>