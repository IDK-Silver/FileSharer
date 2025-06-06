<template>
  <v-app>
    <v-main>
      <!-- 主要內容區域 -->
      <router-view />
    </v-main>

    <!-- 全局通知 Snackbar 現在位於 v-app 內部 -->
    <v-snackbar
      v-model="showErrorSnackbar"
      color="error"
      timeout="5000"
      location="top right"
      multi-line
    >
      {{ authStore.error }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="clearAuthError">
          關閉
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const showErrorSnackbar = ref(false);

onMounted(async () => {
  if (authStore.accessToken && !authStore.user) {
    console.log('App.vue onMounted: 偵測到 accessToken，嘗試獲取使用者資訊');
    await authStore.fetchCurrentUser();
  }
});

watch(() => authStore.error, (newError) => {
  if (newError) {
    showErrorSnackbar.value = true;
  }
});

const clearAuthError = () => {
  authStore.error = null;
  showErrorSnackbar.value = false;
};
</script>

<style>
/* 全局樣式 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-y: auto; /* 確保在需要時 html/body 有滾動條 */
}
.v-application {
  min-height: 100vh; /* 確保 v-app 至少和視窗一樣高 */
}
</style>