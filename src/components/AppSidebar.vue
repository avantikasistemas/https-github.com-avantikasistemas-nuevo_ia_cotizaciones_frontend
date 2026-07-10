<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img v-if="!collapsed" src="@/assets/logo.png" alt="Avantika" class="logo-full" />
      <img v-else src="@/assets/Avantika-icon.png" alt="A" class="logo-icon" />
    </div>

    <!-- Navegación -->
    <nav class="sidebar-nav">
      <RouterLink :to="{ name: 'correos' }" class="nav-item" active-class="nav-item--active">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        <span class="nav-label">Correos</span>
      </RouterLink>

      <p class="nav-section-label">Cotizaciones</p>

      <RouterLink :to="{ name: 'solicitudes' }" class="nav-item" active-class="nav-item--active">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>
        <span class="nav-label">Solicitudes</span>
      </RouterLink>

      <RouterLink :to="{ name: 'clientes' }" class="nav-item" active-class="nav-item--active">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span class="nav-label">Clientes</span>
      </RouterLink>

      <RouterLink :to="{ name: 'dashboard' }" class="nav-item" active-class="nav-item--active">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        <span class="nav-label">Dashboard</span>
      </RouterLink>
    </nav>

    <!-- Botón colapsar -->
    <button class="collapse-btn" @click="$emit('toggle')" :title="collapsed ? 'Expandir' : 'Colapsar'">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="collapsed ? 'transform:rotate(180deg)' : ''">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
  </aside>
</template>

<script setup>
defineProps({ collapsed: Boolean })
defineEmits(['toggle'])
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  position: relative;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 64px;
}

/* Logo */
.sidebar-logo {
  padding: 20px 16px 16px;
  display: flex;
  align-items: center;
  min-height: 72px;
}

.logo-full {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.logo-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  gap: 2px;
  overflow: hidden;
}

.nav-section-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  padding: 16px 8px 6px;
  white-space: nowrap;
  overflow: hidden;
  margin: 0;
}

.collapsed .nav-section-label {
  opacity: 0;
  height: 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.nav-item--active {
  background: #eff6ff;
  color: #1e3a8a;
}

.nav-item--active svg {
  color: #1e3a8a;
}

.nav-label {
  overflow: hidden;
  transition: opacity 0.2s, width 0.25s;
}

.collapsed .nav-label {
  opacity: 0;
  width: 0;
}

/* Botón colapsar */
.collapse-btn {
  position: absolute;
  top: 72px;
  right: -12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: background 0.15s, color 0.15s;
  z-index: 10;
}

.collapse-btn:hover {
  background: #f3f4f6;
  color: #111827;
}
</style>
