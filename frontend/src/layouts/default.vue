<template>
  <v-app>
    <!-- 側邊導航欄 -->
    <v-navigation-drawer app v-model="drawer" temporary>
      <v-list nav dense>
        <v-list-item prepend-icon="mdi-view-dashboard" title="儀表板" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-account-circle" title="個人資料" to="/profile"></v-list-item>
        <v-list-item v-if="isAdmin" prepend-icon="mdi-account-group" title="使用者管理" to="/admin/users"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 頂部應用欄 -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>FileSharer</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-chip v-if="user" class="mr-2" color="white" text-color="primary">
        <v-icon start icon="mdi-account-circle"></v-icon>
        {{ user.username }} ({{ user.role }})
      </v-chip>
      <v-btn icon @click="handleLogout"> <!-- 登出按鈕 -->
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- 主要內容區域 -->
    <v-main>
    <v-container fluid>
        <router-view />
    </v-container>
    </v-main>

    <!-- 底部頁尾 -->
    <v-footer app padless>
      <v-col class="text-center" cols="12">
        {{ new Date().getFullYear() }} — <strong>FileSharer</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const drawer = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);

const handleLogout = async () => {
  await authStore.logout(); // 呼叫 Pinia store 中的 logout action
  router.push('/login');    // 登出後導向到登入頁面
};
</script>

<style scoped>
/* 您可以在這裡加入此版面特定的樣式 */
</style>