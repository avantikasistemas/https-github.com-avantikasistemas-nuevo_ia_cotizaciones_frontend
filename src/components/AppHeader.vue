<template>
  <header class="app-header">
    <h1 class="page-title">{{ title }}</h1>

    <div class="header-right">
      <!-- Indicador online -->
      <span class="online-dot" title="En línea"></span>

      <!-- Avatar con menú -->
      <div class="avatar-wrapper" ref="avatarRef">
        <button class="avatar-btn" @click="menuOpen = !menuOpen">
          {{ initials }}
        </button>

        <div v-if="menuOpen" class="avatar-menu">
          <!-- Nombre del usuario -->
          <div class="avatar-menu-user">
            <span class="avatar-menu-name">{{ user?.name ?? user?.username }}</span>
          </div>

          <hr class="avatar-menu-divider" />

          <!-- Usuarios del Sistema -->
          <button class="avatar-menu-item" @click="goTo('usuarios')">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Usuarios del Sistema
          </button>

          <hr class="avatar-menu-divider" />

          <!-- Logout -->
          <button class="avatar-menu-item avatar-menu-item--danger" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const props = defineProps({ title: { type: String, default: '' } })

const router    = useRouter()
const authStore = useAuthStore()
const menuOpen  = ref(false)
const avatarRef = ref(null)

const user = computed(() => authStore.user)

const initials = computed(() => {
  const name = user.value?.name ?? user.value?.username ?? ''
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
})

function goTo(name) {
  menuOpen.value = false
  router.push({ name })
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}

function onClickOutside(e) {
  if (avatarRef.value && !avatarRef.value.contains(e.target)) menuOpen.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.app-header {
  height: 56px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.online-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  display: block;
}

/* Avatar */
.avatar-wrapper {
  position: relative;
}

.avatar-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #1e3a8a;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.avatar-btn:hover {
  background: #1e40af;
}

/* Menú */
.avatar-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  min-width: 180px;
  z-index: 100;
  overflow: hidden;
}

.avatar-menu-user {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.avatar-menu-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.avatar-menu-role {
  font-size: 0.8rem;
  color: #6b7280;
}

.avatar-menu-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0;
}

.avatar-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  text-align: left;
  transition: background 0.15s;
}

.avatar-menu-item:hover {
  background: #f9fafb;
}

.avatar-menu-item--danger {
  color: #ef4444;
}

.avatar-menu-item--danger:hover {
  background: #fef2f2;
}
</style>
