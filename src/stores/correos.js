import { ref } from 'vue'
import { defineStore } from 'pinia'
import { correosService } from '@/services/correosService.js'

export const useCorreosStore = defineStore('correos', () => {
  const items          = ref([])
  const total          = ref(0)
  const pages          = ref(1)
  const loading        = ref(false)
  const detailLoading  = ref(false)
  const error          = ref(null)
  const selected       = ref(null)

  async function fetchAll(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const res   = await correosService.listar(params)
      const data  = res.data ?? res
      items.value = data.items ?? []
      total.value = data.total ?? 0
      pages.value = data.pages ?? 1
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchDetalle(id) {
    detailLoading.value = true
    error.value         = null
    try {
      const res      = await correosService.detalle({ id })
      selected.value = res.data ?? res
    } catch (e) {
      error.value = e.message
    } finally {
      detailLoading.value = false
    }
  }

  function clearSelected() {
    selected.value = null
  }

  return {
    items, total, pages, loading, detailLoading, error, selected,
    fetchAll, fetchDetalle, clearSelected,
  }
})
