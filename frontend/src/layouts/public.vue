<template>
  <v-app>
    <!-- 簡潔的公開頁面應用欄 -->
    <v-app-bar 
      app 
      color="white" 
      elevation="1"
      height="64"
      class="public-app-bar"
    >
      <v-container fluid class="d-flex align-center px-8">
        <!-- 品牌標誌 -->
        <div class="d-flex align-center">
          <v-icon icon="mdi-cloud" size="24" color="primary" class="mr-2"></v-icon>
          <span class="text-h6 font-weight-medium text-primary">File Sharer</span>
        </div>
        
        <v-spacer></v-spacer>
        
        <!-- 導航連結 -->
        <div class="d-flex align-center">
          <v-btn
            :to="'/login'"
            variant="text"
            class="mr-2 text-none"
            color="primary"
          >
            登入
          </v-btn>
          
          <v-btn
            :to="'/register'"
            variant="outlined"
            color="primary"
            class="text-none"
          >
            註冊
          </v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <!-- 主要內容區域 -->
    <v-main class="public-main">
      <router-view />
    </v-main>

    <!-- 簡潔的頁尾 -->
    <v-footer 
      app 
      color="grey-lighten-4" 
      class="public-footer"
      height="48"
    >
      <v-container>
        <div class="d-flex align-center justify-center">
          <span class="text-caption text-grey">
            © {{ new Date().getFullYear() }} File Sharer
          </span>
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
// 公開頁面佈局不需要特定邏輯
</script>

<style scoped>
/* 公開頁面應用欄樣式 */
.public-app-bar {
  border-bottom: 1px solid #e0e0e0;
}

/* 主要內容區域 */
.public-main {
  background-color: #f5f5f5;
  min-height: calc(100vh - 112px); /* 扣除應用欄和頁尾高度 */
}

/* 公開頁面頁尾 */
.public-footer {
  border-top: 1px solid #e0e0e0;
}

/* 響應式設計 */
@media (max-width: 600px) {
  .public-app-bar {
    height: 56px !important;
  }
  
  .v-btn {
    min-width: auto !important;
    padding: 0 12px !important;
  }
  
  .text-h6 {
    font-size: 1.1rem !important;
  }
}

@media (max-width: 400px) {
  .v-btn {
    padding: 0 8px !important;
    font-size: 0.875rem;
  }
}
</style>