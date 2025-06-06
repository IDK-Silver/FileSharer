<template>
  <v-app>
    <!-- 分層的應用欄 -->
    <v-app-bar 
      app 
      color="white" 
      elevation="0"
      height="100"
      class="border-b-thin"
    >
      <!-- 第一行：品牌標誌和使用者資訊 -->
      <v-container fluid class="d-flex align-center py-2 px-8">
        <!-- 品牌標誌 -->
        <div class="d-flex align-center">
          <v-icon icon="mdi-cloud" size="28" color="primary" class="mr-3"></v-icon>
          <span class="text-h5 font-weight-bold text-primary">File Sharer</span>
        </div>
        
        <v-spacer></v-spacer>
        
        <!-- 使用者區域 -->
        <div class="d-flex align-center" v-if="user">
          <div class="text-right mr-4">
            <div class="text-body-2 font-weight-medium text-grey-darken-2">{{ user.username }}</div>
            <div class="text-caption text-grey">{{ getRoleDisplayName(user.role) }}</div>
          </div>
          
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                variant="text"
                class="user-btn"
                v-bind="props"
                size="40"
              >
                <v-icon size="20">mdi-account</v-icon>
              </v-btn>
            </template>
            
            <v-list min-width="160">
              <v-list-item @click="router.push('/profile')">
                <template v-slot:prepend>
                  <v-icon>mdi-account-cog</v-icon>
                </template>
                <v-list-item-title>個人設定</v-list-item-title>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-list-item @click="handleLogout">
                <template v-slot:prepend>
                  <v-icon color="error">mdi-logout</v-icon>
                </template>
                <v-list-item-title>登出</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-container>

      <!-- 第二行：導航選項卡 -->
      <template v-slot:extension>
        <v-container fluid class="py-2 px-6 bg-grey-lighten-5">
          <div class="d-flex align-center">
            <v-btn
              :to="'/'"
              variant="text"
              class="mx-2 text-none nav-btn"
              :class="{ 'nav-btn--active': $route.path === '/' }"
            >
              <v-icon start size="18">mdi-view-dashboard</v-icon>
              個人檔案
            </v-btn>
            
            <v-btn
              :to="'/profile'"
              variant="text"
              class="mx-2 text-none nav-btn"
              :class="{ 'nav-btn--active': $route.path === '/profile' }"
            >
              <v-icon start size="18">mdi-account-cog</v-icon>
              個人資料
            </v-btn>
            
            <v-btn
              v-if="isManagerOrAdmin"
              :to="'/admin/files'"
              variant="text"
              class="mx-2 text-none nav-btn"
              :class="{ 'nav-btn--active': $route.path === '/admin/files' }"
            >
              <v-icon start size="18">mdi-file-multiple</v-icon>
              檔案管理
            </v-btn>
            
            <v-btn
              v-if="isAdmin"
              :to="'/admin/users'"
              variant="text"
              class="mx-2 text-none nav-btn"
              :class="{ 'nav-btn--active': $route.path === '/admin/users' }"
            >
              <v-icon start size="18">mdi-account-group</v-icon>
              使用者管理
            </v-btn>
          </div>
        </v-container>
      </template>
    </v-app-bar>

    <!-- 主要內容區域 -->
    <v-main class="bg-grey-lighten-4">
      <router-view />
    </v-main>

    <!-- 簡化的頁尾 -->
    <v-footer 
      app 
      color="white" 
      elevation="0"
      height="40"
      class="border-t-thin"
    >
      <v-container>
        <div class="d-flex align-center justify-center">
          <span class="text-caption text-grey">
            © {{ new Date().getFullYear() }} FileSharer
          </span>
        </div>
      </v-container>
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

// 獲取角色顯示名稱
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin':
      return '管理員';
    case 'manager':
      return '管理者';
    case 'user':
    default:
      return '使用者';
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* 邊框樣式 */
.border-b-thin {
  border-bottom: 1px solid #e0e0e0;
}

.border-t-thin {
  border-top: 1px solid #e0e0e0;
}

/* 導航按鈕統一樣式 */
.nav-btn {
  color: #616161 !important;
  font-weight: 500;
  border-radius: 8px;
  padding: 8px 16px !important;
}

.nav-btn:hover {
  background-color: rgba(25, 118, 210, 0.08) !important;
  color: #1976d2 !important;
}

.nav-btn--active {
  color: #1976d2 !important;
  background-color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 使用者按鈕樣式 */
.user-btn {
  color: #616161 !important;
  border-radius: 50%;
}

.user-btn:hover {
  background-color: rgba(25, 118, 210, 0.08) !important;
  color: #1976d2 !important;
}

/* 響應式設計 */
@media (max-width: 960px) {
  .v-app-bar {
    height: 88px !important;
  }
  
  .nav-btn {
    min-width: auto !important;
    padding: 6px 12px !important;
    font-size: 0.875rem;
  }
  
  .nav-btn .v-icon {
    margin-right: 4px !important;
  }
  
  .text-h5 {
    font-size: 1.25rem !important;
  }
}

@media (max-width: 600px) {
  .v-app-bar {
    height: 80px !important;
  }
  
  .nav-btn {
    padding: 6px 8px !important;
    font-size: 0.75rem !important;
    margin: 0 4px !important;
  }
  
  .nav-btn .v-icon {
    display: none;
  }
  
  .text-right {
    display: none;
  }
  
  .text-h5 {
    font-size: 1.1rem !important;
  }
}
</style>