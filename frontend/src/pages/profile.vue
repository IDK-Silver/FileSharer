<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-h5">
              個人資料
            </v-card-title>
            <v-divider></v-divider>
            <v-list lines="two">
              <v-list-item
                title="使用者名稱"
                :subtitle="authStore.user?.username || 'N/A'"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
              </v-list-item>
  
              <v-list-item
                title="電子郵件"
                :subtitle="authStore.user?.email || 'N/A'"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
              </v-list-item>
  
              <v-list-item
                title="角色"
                :subtitle="authStore.user?.role || 'N/A'"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-shield-account</v-icon>
                </template>
              </v-list-item>
               <v-list-item
                title="帳戶狀態"
                :subtitle="authStore.user?.is_active ? '啟用中' : '已停用'"
              >
                <template v-slot:prepend>
                  <v-icon :color="authStore.user?.is_active ? 'success' : 'error'">mdi-circle</v-icon>
                </template>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="editDialog = true">修改使用者名稱</v-btn>
              <v-btn color="secondary">修改密碼</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
  
      <v-dialog v-model="editDialog" max-width="400px">
          <v-card>
              <v-card-title>修改使用者名稱</v-card-title>
              <v-card-text>
                  此功能待開發。
              </v-card-text>
              <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="editDialog = false">關閉</v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  
  const authStore = useAuthStore();
  const editDialog = ref(false);
  
  </script>