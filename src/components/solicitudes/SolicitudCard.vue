<template>
  <div
    class="card"
    draggable="true"
    @dragstart="onDragStart"
  >
    <p class="card-subject">{{ subject }}</p>

    <div class="card-meta">
      <!-- Asesor -->
      <div class="card-meta-row">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>{{ assignee ?? 'Sin asignar' }}</span>
      </div>

      <!-- Cliente -->
      <div class="card-meta-row">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span class="card-client">{{ client ?? 'Cliente no especificado' }}</span>
      </div>

      <!-- Tiempo -->
      <div class="card-meta-row">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>{{ timeAgo(createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { timeAgo } from '@/utils/time.js'

const props = defineProps({
  id:        { type: Number, required: true },
  subject:   { type: String, required: true },
  assignee:  { type: String, default: null },
  client:    { type: String, default: null },
  createdAt: { type: String, required: true },
})

const emit = defineEmits(['drag-start'])

function onDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('solicitud-id', String(props.id))
  emit('drag-start', props.id)
}
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  cursor: grab;
  transition: box-shadow 0.15s, border-color 0.15s;
  user-select: none;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-color: #d1d5db;
}

.card:active {
  cursor: grabbing;
}

.card-subject {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.card-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.775rem;
  color: #6b7280;
}

.card-meta-row svg {
  flex-shrink: 0;
  color: #9ca3af;
}

.card-client {
  text-transform: uppercase;
  font-size: 0.74rem;
  letter-spacing: 0.01em;
}
</style>
