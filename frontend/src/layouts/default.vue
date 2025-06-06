<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>FileSharer</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-chip v-if="user" class="mr-2" color="white" text-color="primary">
        <v-icon start icon="mdi-account-circle"></v-icon>
        {{ user.username }} ({{ user.role }})
      </v-chip>
      <v-btn icon @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs align-with-title>
          <v-tab to="/">個人檔案</v-tab>
          <v-tab to="/profile">個人資料</v-tab>
          <v-tab v-if="isManagerOrAdmin" to="/admin/files">檔案管理</v-tab>
          <v-tab v-if="isAdmin" to="/admin/users">使用者管理</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app padless>
      <v-col class="text-center" cols="12">
        {{ new Date().getFullYear() }} — <strong>FileSharer</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.user?.role === 'admin');
const isManagerOrAdmin = computed(() => ['admin', 'manager'].includes(authStore.user?.role || ''));

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>