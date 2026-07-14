<template>
  <div class="correos-layout">

    <!-- ── Panel izquierdo: lista ─────────────────────────────────── -->
    <aside class="correos-sidebar" :class="{ 'sidebar-hidden': selected && isMobile }">

      <!-- Cabecera: título + tabs -->
      <div class="sidebar-header">
        <h2 class="sidebar-title">Bandeja de entrada</h2>
        <div class="read-tabs">
          <button
            v-for="tab in READ_TABS" :key="tab.value"
            class="read-tab"
            :class="{ active: leidosTab === tab.value }"
            @click="setTab(tab.value)"
          >{{ tab.label }}</button>
        </div>
      </div>

      <!-- Buscador + botón filtros -->
      <div class="sidebar-toolbar">
        <div class="search-wrap">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input v-model="search" type="text" placeholder="Buscar correos..."
            class="search-input" @input="onSearch" />
        </div>

        <div class="toolbar-actions">
          <!-- Botón filtros -->
          <div class="filter-wrap" ref="filterWrapRef">
            <button
              class="icon-btn"
              :class="{ active: filterOpen || hasActiveFilters }"
              @click="filterOpen = !filterOpen"
              title="Filtros"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span v-if="hasActiveFilters" class="filter-dot"></span>
            </button>

            <!-- Panel de filtros -->
            <div v-if="filterOpen" class="filter-panel">
              <div class="filter-panel-header">
                <span class="filter-panel-title">Filtros de correo</span>
                <button class="clear-filters-btn" @click="limpiarFiltros">Limpiar filtros</button>
              </div>

              <div class="filter-group">
                <label class="filter-label">Ordenar por fecha</label>
                <select v-model="sortOrder" class="filter-select" @change="aplicarFiltros">
                  <option value="desc">Más recientes primero</option>
                  <option value="asc">Más antiguos primero</option>
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Rango de fechas</label>
                <div class="date-range">
                  <input type="date" v-model="dateFrom" class="filter-date" placeholder="Desde" @change="aplicarFiltros" />
                  <input type="date" v-model="dateTo"   class="filter-date" placeholder="Hasta" @change="aplicarFiltros" />
                </div>
              </div>
            </div>
          </div>

          <!-- Refrescar -->
          <button class="icon-btn" @click="recargar" :disabled="store.loading" title="Recargar">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              :class="{ spinning: store.loading }">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Cargando -->
      <div v-if="store.loading" class="state-center">
        <div class="spinner"></div>
        <p>Cargando correos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="store.error" class="state-center state-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ store.error }}</p>
        <button class="btn-retry" @click="recargar">Reintentar</button>
      </div>

      <!-- Vacío -->
      <div v-else-if="!store.items.length" class="state-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
        <p>No hay correos</p>
      </div>

      <!-- Lista -->
      <ul v-else class="email-list">
        <li
          v-for="mail in store.items"
          :key="mail.id"
          class="email-item"
          :class="{ selected: selected?.id === mail.id, unread: !mail.leido }"
          @click="abrirCorreo(mail)"
        >
          <div class="email-avatar">{{ iniciales(mail.remitente_nombre) }}</div>

          <div class="email-info">
            <div class="email-header-row">
              <span class="email-sender">{{ mail.remitente_nombre || mail.remitente_email }}</span>
              <span class="email-date">{{ formatFechaCorta(mail.fecha) }}</span>
            </div>
            <div class="email-subject">{{ mail.asunto }}</div>
            <div class="email-preview">{{ mail.preview }}</div>
            <div v-if="mail.tiene_adjuntos" class="email-badges">
              <span class="badge-adj">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                Adjuntos
              </span>
            </div>
          </div>

          <div v-if="!mail.leido" class="unread-dot"></div>
        </li>
      </ul>

      <!-- Paginación -->
      <div v-if="store.pages > 1" class="sidebar-pagination">
        <button :disabled="page === 1" @click="cambiarPagina(page - 1)">‹</button>
        <span>{{ page }} / {{ store.pages }}</span>
        <button :disabled="page >= store.pages" @click="cambiarPagina(page + 1)">›</button>
      </div>
    </aside>

    <!-- ── Panel derecho: detalle ─────────────────────────────────── -->
    <section class="correos-detail" :class="{ 'detail-visible': selected || store.detailLoading }">

      <button v-if="isMobile && (selected || store.detailLoading)" class="back-btn" @click="store.clearSelected()">
        ← Volver
      </button>

      <div v-if="store.detailLoading" class="state-center">
        <div class="spinner"></div>
        <p>Cargando correo...</p>
      </div>

      <template v-else-if="selected">
        <div class="detail-header">
          <h2 class="detail-subject">{{ selected.asunto }}</h2>
          <div class="detail-meta">
            <div class="detail-avatar">{{ iniciales(selected.remitente_nombre) }}</div>
            <div class="detail-sender-info">
              <span class="detail-sender-name">{{ selected.remitente_nombre }}</span>
              <span class="detail-sender-email">&lt;{{ selected.remitente_email }}&gt;</span>
            </div>
            <span class="detail-date">{{ formatFechaLarga(selected.fecha) }}</span>
          </div>
          <div v-if="selected.cc?.length" class="detail-cc">
            CC: {{ selected.cc.map(r => r.address).join(', ') }}
          </div>
        </div>

        <!-- Adjuntos ANTES del cuerpo para acceder sin scrollear -->
        <div v-if="selected.adjuntos?.length" class="detail-attachments">
          <h3 class="att-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
            Adjuntos ({{ selected.adjuntos.length }})
          </h3>
          <div class="att-list">
            <a
              v-for="adj in selected.adjuntos" :key="adj.id"
              class="att-item"
              :href="adj.contenido_b64 ? `data:${adj.tipo};base64,${adj.contenido_b64}` : '#'"
              :download="adj.nombre"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span class="att-name">{{ adj.nombre }}</span>
              <span class="att-size">{{ formatTamano(adj.tamano_bytes) }}</span>
            </a>
          </div>
        </div>

        <div class="detail-body">
          <iframe
            v-if="selected.cuerpo_tipo === 'html'"
            :srcdoc="selected.cuerpo_html"
            class="email-iframe"
            sandbox="allow-same-origin"
            ref="iframeRef"
            @load="ajustarIframe"
          ></iframe>
          <pre v-else class="email-text">{{ selected.cuerpo_html }}</pre>
        </div>
      </template>

      <div v-else class="state-center empty-detail">
        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
        <p>Selecciona un correo para leerlo</p>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCorreosStore } from '@/stores/correos.js'

const READ_TABS = [
  { label: 'Todos',     value: null  },
  { label: 'Leídos',    value: true  },
  { label: 'No leídos', value: false },
]

const store         = useCorreosStore()
const search        = ref('')
const leidosTab     = ref(null)       // null | true | false
const sortOrder     = ref('desc')
const dateFrom      = ref('')
const dateTo        = ref('')
const page          = ref(1)
const filterOpen    = ref(false)
const filterWrapRef = ref(null)
const iframeRef     = ref(null)
const windowWidth   = ref(window.innerWidth)
const searchTimeout = ref(null)

const isMobile = computed(() => windowWidth.value < 768)
const selected = computed(() => store.selected)

const hasActiveFilters = computed(() =>
  sortOrder.value !== 'desc' || dateFrom.value || dateTo.value
)

function onResize() { windowWidth.value = window.innerWidth }

function onClickOutside(e) {
  if (filterWrapRef.value && !filterWrapRef.value.contains(e.target)) {
    filterOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  document.addEventListener('click', onClickOutside)
  cargar()
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', onClickOutside)
})

function buildParams() {
  return {
    page:       page.value,
    limit:      20,
    search:     search.value,
    leidos:     leidosTab.value,
    sort_order: sortOrder.value,
    date_from:  dateFrom.value,
    date_to:    dateTo.value,
  }
}

function cargar() { store.fetchAll(buildParams()) }

function recargar() {
  page.value = 1
  store.clearSelected()
  cargar()
}

function onSearch() {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => { page.value = 1; cargar() }, 400)
}

function setTab(val) {
  leidosTab.value = val
  page.value = 1
  cargar()
}

function aplicarFiltros() {
  page.value = 1
  cargar()
}

function limpiarFiltros() {
  sortOrder.value = 'desc'
  dateFrom.value  = ''
  dateTo.value    = ''
  page.value      = 1
  cargar()
}

function cambiarPagina(n) {
  page.value = n
  cargar()
}

async function abrirCorreo(mail) {
  await store.fetchDetalle(mail.id)
}

function ajustarIframe() {
  try {
    const iframe = iframeRef.value
    if (!iframe) return
    const h = iframe.contentDocument?.body?.scrollHeight
    if (h) iframe.style.height = h + 32 + 'px'
  } catch (_) {}
}

function iniciales(nombre) {
  if (!nombre) return '?'
  return nombre.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function formatFechaCorta(iso) {
  if (!iso) return ''
  const d   = new Date(iso)
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  const dia = new Date(d); dia.setHours(0, 0, 0, 0)
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  if (dia.getTime() === hoy.getTime()) return hora
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1)
  if (dia.getTime() === ayer.getTime()) return `Ayer ${hora}`
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
  return `${fecha} ${hora}`
}

function formatFechaLarga(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatTamano(bytes) {
  if (!bytes) return ''
  if (bytes < 1024)    return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}
</script>

<style scoped>
.correos-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: #f9fafb;
}

/* ── Sidebar ─────────────────────────────────────────────────────── */
.correos-sidebar {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
}

/* ── Cabecera sidebar ────────────────────────────────────────────── */
.sidebar-header {
  padding: 16px 14px 0;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 10px;
}

.read-tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid #e5e7eb;
  margin: 0 -14px;
  padding: 0 14px;
}

.read-tab {
  padding: 6px 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.82rem;
  color: #6b7280;
  cursor: pointer;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}

.read-tab.active {
  color: #1d4ed8;
  border-bottom-color: #1d4ed8;
  font-weight: 600;
}

/* ── Toolbar búsqueda + filtros ──────────────────────────────────── */
.sidebar-toolbar {
  padding: 10px 14px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.search-wrap {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 7px 10px 7px 30px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.8rem;
  outline: none;
  box-sizing: border-box;
  transition: border 0.15s;
}

.search-input:focus { border-color: #3b82f6; }

.toolbar-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.icon-btn {
  position: relative;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  transition: background 0.15s, border-color 0.15s;
}

.icon-btn:hover         { background: #f3f4f6; }
.icon-btn.active        { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; }
.icon-btn:disabled      { opacity: 0.5; cursor: not-allowed; }

.filter-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
}

/* ── Panel de filtros ────────────────────────────────────────────── */
.filter-wrap { position: relative; }

.filter-panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 240px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 50;
  padding: 14px;
}

.filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.filter-panel-title {
  font-size: 0.83rem;
  font-weight: 600;
  color: #111827;
}

.clear-filters-btn {
  background: none;
  border: none;
  font-size: 0.78rem;
  color: #3b82f6;
  cursor: pointer;
  padding: 0;
}

.clear-filters-btn:hover { text-decoration: underline; }

.filter-group {
  margin-bottom: 12px;
}

.filter-group:last-child { margin-bottom: 0; }

.filter-label {
  display: block;
  font-size: 0.78rem;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

.filter-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #374151;
  outline: none;
  cursor: pointer;
}

.filter-select:focus { border-color: #3b82f6; }

.date-range {
  display: flex;
  gap: 6px;
}

.filter-date {
  flex: 1;
  padding: 6px 6px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.76rem;
  color: #374151;
  outline: none;
  min-width: 0;
}

.filter-date:focus { border-color: #3b82f6; }

/* ── Lista de correos ────────────────────────────────────────────── */
.email-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.email-item {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  position: relative;
  transition: background 0.12s;
}

.email-item:hover           { background: #f9fafb; }
.email-item.selected        { background: #eff6ff; }
.email-item.unread          { background: #fafcff; }
.email-item.unread .email-sender  { font-weight: 700; }
.email-item.unread .email-subject { font-weight: 600; color: #111827; }

.email-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background: #1e3a8a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
}

.email-info { flex: 1; min-width: 0; }

.email-header-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
}

.email-sender {
  font-size: 0.83rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-date {
  font-size: 0.72rem;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.email-subject {
  font-size: 0.8rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.email-preview {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.email-badges { display: flex; gap: 4px; }

.badge-adj {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 4px;
  padding: 1px 5px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  background: #3b82f6;
  align-self: center;
}

.sidebar-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.8rem;
  color: #6b7280;
  flex-shrink: 0;
}

.sidebar-pagination button {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 2px 10px;
  cursor: pointer;
  font-size: 1rem;
  color: #374151;
}

.sidebar-pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Detalle ─────────────────────────────────────────────────────── */
.correos-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

.detail-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.detail-subject {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
  line-height: 1.35;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-avatar {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 50%;
  background: #1e3a8a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
}

.detail-sender-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.detail-sender-name  { font-size: 0.875rem; font-weight: 600; color: #111827; }
.detail-sender-email { font-size: 0.78rem; color: #6b7280; }
.detail-date         { font-size: 0.78rem; color: #9ca3af; }
.detail-cc           { margin-top: 8px; font-size: 0.78rem; color: #6b7280; }

.detail-body { flex: 1; overflow-y: auto; }

.email-iframe {
  width: 100%;
  min-height: 300px;
  border: none;
  display: block;
}

.email-text {
  padding: 20px 24px;
  font-size: 0.875rem;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-family: inherit;
}

.detail-attachments {
  padding: 14px 24px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.att-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.83rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 10px;
}

.att-list { display: flex; flex-wrap: wrap; gap: 8px; }

.att-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  text-decoration: none;
  color: #374151;
  font-size: 0.8rem;
  transition: background 0.15s, border-color 0.15s;
  max-width: 220px;
}

.att-item:hover { background: #eff6ff; border-color: #3b82f6; }

.att-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.att-size { color: #9ca3af; font-size: 0.72rem; white-space: nowrap; }

/* ── Estados ────────────────────────────────────────────────────── */
.state-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 24px;
  text-align: center;
}

.state-error { color: #ef4444; }

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.btn-retry {
  padding: 6px 16px;
  border: 1px solid #ef4444;
  border-radius: 8px;
  background: none;
  color: #ef4444;
  font-size: 0.8rem;
  cursor: pointer;
}

.empty-detail { color: #d1d5db; }

.back-btn { display: none; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .correos-layout { position: relative; }

  .correos-sidebar {
    width: 100%;
    position: absolute;
    inset: 0;
    z-index: 1;
    transition: transform 0.25s ease;
  }

  .correos-sidebar.sidebar-hidden { transform: translateX(-100%); }

  .correos-detail {
    position: absolute;
    inset: 0;
    z-index: 2;
    transform: translateX(100%);
    transition: transform 0.25s ease;
  }

  .correos-detail.detail-visible { transform: translateX(0); }

  .back-btn {
    display: block;
    padding: 10px 16px;
    background: none;
    border: none;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.875rem;
    color: #3b82f6;
    cursor: pointer;
    text-align: left;
    width: 100%;
  }
}
</style>
