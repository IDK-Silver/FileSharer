<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
// 全局的會話恢復邏輯放在這裡，確保 App 啟動時就檢查
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.accessToken && !authStore.user) {
    await authStore.fetchCurrentUser();
  }
});
</script>