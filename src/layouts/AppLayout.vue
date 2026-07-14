<template>
  <div class="app-layout">
    <AppSidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

    <div class="app-main">
      <AppHeader :title="pageTitle" />
      <div class="app-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader  from '@/components/AppHeader.vue'

const sidebarCollapsed = ref(false)
const route = useRoute()

const PAGE_TITLES = {
  solicitudes: 'Solicitudes',
  clientes:    'Clientes',
  dashboard:   'Dashboard',
  correos:     'Correos',
}

const pageTitle = computed(() => PAGE_TITLES[route.name] ?? '')
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f9fafb;
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
