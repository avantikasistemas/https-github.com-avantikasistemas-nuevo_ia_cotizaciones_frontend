<template>
  <div class="solicitudes">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <!-- Toggle kanban / tabla -->
        <div class="view-toggle">
          <button
            class="toggle-btn"
            :class="{ active: store.viewMode === 'kanban' }"
            title="Vista kanban"
            @click="store.setViewMode('kanban')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="18" x="3" y="3" rx="1"/><rect width="7" height="10" x="14" y="3" rx="1"/><rect width="7" height="6" x="14" y="15" rx="1"/></svg>
          </button>
          <button
            class="toggle-btn"
            :class="{ active: store.viewMode === 'table' }"
            title="Vista tabla"
            @click="store.setViewMode('table')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 9h18M3 15h18"/><rect width="18" height="18" x="3" y="3" rx="1"/></svg>
          </button>
        </div>

        <!-- Filtros -->
        <button class="btn-outline">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtros
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <!-- Refresh -->
        <button class="btn-icon" title="Actualizar" @click="store.fetchAll()" :class="{ spinning: store.loading }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
        </button>
      </div>

      <button class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Nueva Solicitud
      </button>
    </div>

    <!-- ── Vista Kanban ── -->
    <div v-if="store.viewMode === 'kanban'" class="kanban">
      <div
        v-for="stage in PIPELINE_STAGES"
        :key="stage.id"
        class="kanban-col"
        @dragover.prevent="onDragOver(stage.id)"
        @dragleave="dragOverStage = null"
        @drop="onDrop(stage.id)"
        :class="{ 'kanban-col--over': dragOverStage === stage.id }"
      >
        <!-- Cabecera de columna -->
        <div class="col-header">
          <div>
            <h2 class="col-title">{{ stage.label }}</h2>
            <p class="col-desc">{{ stage.description }}</p>
          </div>
          <span class="col-count">
            {{ store.filteredByStatus[stage.id]?.length ?? 0 }} Solicitudes
          </span>
        </div>

        <!-- Buscador por columna -->
        <div class="col-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Buscar en esta columna..."
            :value="store.searchMap[stage.id] ?? ''"
            @input="store.setSearch(stage.id, $event.target.value)"
          />
        </div>

        <!-- Cards -->
        <div class="col-cards">
          <template v-if="store.filteredByStatus[stage.id]?.length">
            <SolicitudCard
              v-for="item in store.filteredByStatus[stage.id]"
              :key="item.id"
              :id="item.id"
              :subject="item.subject"
              :assignee="item.assignee"
              :client="item.client"
              :created-at="item.created_at"
            />
          </template>
          <p v-else class="col-empty">Sin solicitudes</p>
        </div>
      </div>
    </div>

    <!-- ── Vista Tabla ── -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Asunto</th>
            <th>Asesor</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.items" :key="item.id">
            <td class="td-subject">{{ item.subject }}</td>
            <td>{{ item.assignee ?? '—' }}</td>
            <td>{{ item.client ?? '—' }}</td>
            <td>
              <span class="status-badge" :class="`status-badge--${item.status}`">
                {{ stageLabel(item.status) }}
              </span>
            </td>
            <td class="td-date">{{ formatDate(item.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes.js'
import { PIPELINE_STAGES } from '@/constants/solicitudes.js'
import SolicitudCard from '@/components/solicitudes/SolicitudCard.vue'

const store = useSolicitudesStore()
const dragOverStage = ref(null)

onMounted(() => store.fetchAll())

function onDragOver(stageId) {
  dragOverStage.value = stageId
}

function onDrop(stageId) {
  const raw = event.dataTransfer?.getData('solicitud-id')
  if (!raw) return
  store.moveItem(Number(raw), stageId)
  dragOverStage.value = null
}

function stageLabel(statusId) {
  return PIPELINE_STAGES.find(s => s.id === statusId)?.label ?? statusId
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
</script>

<style scoped>
/* ── Layout general ──────────────────────────────────────── */
.solicitudes {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  overflow: hidden;
}

/* ── Toolbar ─────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Toggle kanban/tabla */
.view-toggle {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.toggle-btn {
  padding: 6px 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  transition: background 0.15s, color 0.15s;
}

.toggle-btn:hover { background: #f3f4f6; color: #374151; }
.toggle-btn.active { background: #eff6ff; color: #1e3a8a; }

/* Botones toolbar */
.btn-outline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-outline:hover { background: #f9fafb; }

.btn-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-icon:hover { background: #f3f4f6; color: #111827; }

@keyframes spin { to { transform: rotate(360deg); } }
.spinning svg { animation: spin 0.8s linear infinite; }

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-primary:hover { background: #1e40af; }

/* ── Kanban ──────────────────────────────────────────────── */
.kanban {
  display: flex;
  gap: 0;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px;
  gap: 12px;
  align-items: flex-start;
}

.kanban-col {
  width: 280px;
  min-width: 280px;
  background: #f3f4f6;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}

.kanban-col--over {
  border-color: #93c5fd;
  background: #eff6ff;
}

/* Cabecera columna */
.col-header {
  padding: 12px 14px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.col-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.col-desc {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.col-count {
  display: inline-flex;
  align-items: center;
  background: #e5e7eb;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  width: fit-content;
}

/* Buscador */
.col-search {
  margin: 0 10px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 10px;
}

.col-search svg { color: #9ca3af; flex-shrink: 0; }

.col-search input {
  border: none;
  outline: none;
  font-size: 0.8rem;
  color: #374151;
  width: 100%;
  background: transparent;
}

.col-search input::placeholder { color: #9ca3af; }

/* Cards */
.col-cards {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.col-empty {
  font-size: 0.8rem;
  color: #9ca3af;
  text-align: center;
  padding: 20px 0;
  margin: 0;
}

/* Scrollbar delgada */
.col-cards::-webkit-scrollbar { width: 4px; }
.col-cards::-webkit-scrollbar-track { background: transparent; }
.col-cards::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

/* ── Tabla ───────────────────────────────────────────────── */
.table-wrapper {
  flex: 1;
  overflow: auto;
  padding: 16px 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.data-table th {
  text-align: left;
  padding: 11px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 12px 16px;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f9fafb; }

.td-subject {
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  color: #111827;
}

.td-date { white-space: nowrap; color: #6b7280; font-size: 0.82rem; }

/* Status badges en tabla */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge--pending_ai_analysis  { background: #fef9c3; color: #854d0e; }
.status-badge--pending_human_review { background: #dbeafe; color: #1e3a8a; }
.status-badge--quote_pending        { background: #fce7f3; color: #9d174d; }
.status-badge--quote_ready          { background: #dcfce7; color: #166534; }
.status-badge--quote_sent           { background: #f3f4f6; color: #374151; }
</style>
