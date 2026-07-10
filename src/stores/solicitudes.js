import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { PIPELINE_STAGES } from '@/constants/solicitudes.js'

// ── Mock data (reemplazar con solicitudesService.getAll() cuando el backend esté listo) ──
const MOCK = [
  { id: 1,  subject: 'RV: SOLICITUD ESTUDIO DE MERCADO RV: [Urg]SENA REGIONAL BOLI...', assignee: 'Karla Romero',    client: 'SERVICIO NACIONAL DEL APRE...', status: 'pending_ai_analysis', created_at: '2026-05-10T08:00:00Z' },
  { id: 2,  subject: 'Solicitud de cotización Insumos y reactivos de laboratorio',        assignee: 'Karla Ordosgoitia', client: 'UNIVERSIDAD SIMON BOLIVAR',     status: 'pending_ai_analysis', created_at: '2026-05-12T10:00:00Z' },
  { id: 3,  subject: 'Solicitud Cotización Insumos Laboratorio FSO-0526-00043 - Ce...',   assignee: 'Angelica Olmos',   client: 'CORPORACION CENTRO DE INV...',   status: 'pending_ai_analysis', created_at: '2026-05-15T14:00:00Z' },
  { id: 4,  subject: 'Cotización equipos de medición y calibración para planta',          assignee: 'Carlos Munive',    client: 'ESENTTIA S.A.',                 status: 'pending_ai_analysis', created_at: '2026-05-20T09:00:00Z' },
  { id: 5,  subject: 'RV: Solicitud de cotización',                                       assignee: 'Angelica Olmos',   client: 'LABORATORIO MICROBIOLOGIC...',  status: 'pending_human_review', created_at: '2026-07-10T05:00:00Z' },
  { id: 6,  subject: 'SOLICITUD DE COTIZACIÓN - SENA REGIONAL CESAR Grupo de Apoyo...',   assignee: 'Karla Ordosgoitia', client: 'SENA CENTRO BIOTECNOLOGIC...', status: 'pending_human_review', created_at: '2026-07-09T10:00:00Z' },
  { id: 7,  subject: 'SOLICITUD RV: SOLICITUD DE COTIZACION EQUIPAMIENTO',                assignee: 'Karla Ordosgoitia', client: 'UNIVERSIDAD PONTIFICIA BOLI...', status: 'pending_human_review', created_at: '2026-07-09T10:00:00Z' },
  { id: 8,  subject: 'SOLICITUD RV: Solicitud cotización universidad Militar',            assignee: 'Carlos Munive',    client: 'UNIVERSIDAD MILITAR',           status: 'pending_human_review', created_at: '2026-07-08T14:00:00Z' },
  { id: 9,  subject: 'Solicitud materiales de laboratorio - ref. 2026-0312',              assignee: 'Angelica Olmos',   client: 'INSTITUTO NACIONAL DE SALUD',   status: 'pending_human_review', created_at: '2026-07-07T08:00:00Z' },
  { id: 10, subject: 'SOLICITUD DE COTIZACIONPRESENTACIÓN DE LA OFERTA_INVITACIÓN ...',   assignee: 'Carlos Munive',    client: 'UNIVERSIDAD NACIONAL DE CO...',  status: 'quote_ready',          created_at: '2026-07-10T07:07:00Z' },
  { id: 11, subject: 'Invitación: SOL20260706 - EQUIPOS DE LABORATORIO',                  assignee: 'Angelica Olmos',   client: 'ESENTTIA S.A.',                 status: 'quote_ready',          created_at: '2026-07-10T09:48:00Z' },
  { id: 12, subject: 'solicitud de cotización actualizar Universidad de Antioquia ...',    assignee: 'Carlos Munive',    client: 'UNIVERSIDAD DE ANTIOQUIA',      status: 'quote_ready',          created_at: '2026-07-10T07:00:00Z' },
  { id: 13, subject: 'Solicitud cotizacion Solucion 50',                                   assignee: 'Karla Romero',    client: 'LABORATORIO CLINICO HIGUITA',   status: 'quote_ready',          created_at: '2026-07-09T16:00:00Z' },
  { id: 14, subject: 'RV: Cotización reactivos especializados para diagnóstico',           assignee: 'Karla Ordosgoitia', client: 'CLINICA UNIVERSITARIA COLOM...', status: 'quote_ready',        created_at: '2026-07-08T11:00:00Z' },
  { id: 15, subject: 'Cotización equipos PCR y consumibles 2026',                         assignee: 'Angelica Olmos',   client: 'FUNDACION CARDIOVASCULAR',      status: 'quote_sent',           created_at: '2026-07-05T09:00:00Z' },
]

export const useSolicitudesStore = defineStore('solicitudes', () => {
  // ── Estado ───────────────────────────────────────────────────────────
  const items     = ref([...MOCK])
  const loading   = ref(false)
  const error     = ref(null)
  const viewMode  = ref(localStorage.getItem('solicitudes_view') ?? 'kanban')
  const searchMap = ref({})   // { [stageId]: string }

  // ── Getters ──────────────────────────────────────────────────────────
  const byStatus = computed(() => {
    const map = Object.fromEntries(PIPELINE_STAGES.map(s => [s.id, []]))
    for (const item of items.value) {
      if (map[item.status] !== undefined) map[item.status].push(item)
    }
    return map
  })

  const filteredByStatus = computed(() => {
    const result = {}
    for (const [stageId, cards] of Object.entries(byStatus.value)) {
      const q = (searchMap.value[stageId] ?? '').toLowerCase()
      result[stageId] = q
        ? cards.filter(c =>
            c.subject.toLowerCase().includes(q) ||
            c.client.toLowerCase().includes(q)  ||
            c.assignee.toLowerCase().includes(q)
          )
        : cards
    }
    return result
  })

  // ── Acciones ─────────────────────────────────────────────────────────
  function setViewMode(mode) {
    viewMode.value = mode
    localStorage.setItem('solicitudes_view', mode)
  }

  function setSearch(stageId, value) {
    searchMap.value = { ...searchMap.value, [stageId]: value }
  }

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      // TODO: items.value = await solicitudesService.getAll()
      items.value = [...MOCK]
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function moveItem(id, newStatus) {
    const item = items.value.find(i => i.id === id)
    if (item) item.status = newStatus
    // TODO: solicitudesService.updateStatus(id, newStatus)
  }

  return {
    items, loading, error, viewMode, searchMap,
    byStatus, filteredByStatus,
    setViewMode, setSearch, fetchAll, moveItem,
  }
})
