// frontend/src/stores/admin.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import * as adminService from "@/services/adminService";
import type { User } from "./auth";
import type { FileMetadata } from "@/services/fileService";

export const useAdminStore = defineStore("admin", () => {
  // --- State ---
  const users = ref<User[]>([]);
  const allFiles = ref<FileMetadata[]>([]);
  const isLoadingUsers = ref(false);
  const isLoadingFiles = ref(false);
  const error = ref<string | null>(null);

  // --- Actions ---

  /**
   * 獲取所有使用者列表
   */
  async function fetchUsers() {
    isLoadingUsers.value = true;
    error.value = null;
    try {
      users.value = await adminService.getAllUsers();
    } catch (e: any) {
      error.value = e.message || "無法獲取使用者列表";
      users.value = [];
    } finally {
      isLoadingUsers.value = false;
    }
  }

  /**
   * 更新指定使用者的資訊
   * @param userId 使用者 ID
   * @param userData 要更新的資料
   */
  async function updateUser(
    userId: number,
    userData: Partial<Pick<User, "role" | "is_active">>
  ) {
    try {
      const updatedUser = await adminService.updateUserByAdmin(
        userId,
        userData
      );
      const index = users.value.findIndex((u) => u.id === userId);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...updatedUser };
      }
    } catch (e: any) {
      console.error("更新使用者失敗:", e);
      // 將錯誤向上拋出，讓 UI 層可以顯示提示
      throw e;
    }
  }

  /**
   * 刪除指定使用者
   * @param userId 使用者 ID
   */
  async function deleteUser(userId: number) {
    try {
      await adminService.deleteUserByAdmin(userId);
      // 從前端列表中移除該使用者
      users.value = users.value.filter((u) => u.id !== userId);
    } catch (e: any) {
      console.error("刪除使用者失敗:", e);
      throw e;
    }
  }

  /**
   * 獲取所有檔案列表
   */
  async function fetchAllFiles(
    filter: { username?: string; email?: string } = {}
  ) {
    isLoadingFiles.value = true;
    error.value = null;
    try {
      allFiles.value = await adminService.getAllFiles(filter);
    } catch (e: any) {
      error.value = e.message || "無法獲取所有檔案列表";
      allFiles.value = [];
    } finally {
      isLoadingFiles.value = false;
    }
  }

  async function createUser(userData: any) {
    // 呼叫 service，成功後將新使用者加到列表頂部
    const newUser = await adminService.createUserByAdmin(userData);
    users.value.unshift(newUser);
  }


  async function resetUserPassword(userId: number, newPassword: string) {
    await adminService.resetPasswordByAdmin(userId, newPassword);
  }

  return {
    users,
    allFiles,
    isLoadingUsers,
    isLoadingFiles,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
    fetchAllFiles,
    createUser,
    resetUserPassword,
  };
});
