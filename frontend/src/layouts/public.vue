<template>
<v-app>
    <v-app-bar app color="primary" dark>
    <v-toolbar-title>FileSharer</v-toolbar-title>
    </v-app-bar>
    <v-main>
    <v-container fluid>
        <router-view />
    </v-container>
    </v-main>
    <v-footer app padless>
    <v-col class="text-center" cols="12">
        {{ new Date().getFullYear() }} — <strong>FileSharer</strong>
    </v-col>
    </v-footer>
</v-app>
</template>

<script setup lang="ts">
// 目前不需要特定的 script 邏輯
</script>

<style scoped>
/* 您可以在這裡加入此版面特定的樣式 */
</style>