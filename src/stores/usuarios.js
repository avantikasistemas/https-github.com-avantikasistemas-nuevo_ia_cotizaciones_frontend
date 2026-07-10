import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usuariosService } from '@/services/usuariosService.js'

export const useUsuariosStore = defineStore('usuarios', () => {
  const items    = ref([])
  const total    = ref(0)
  const pages    = ref(1)
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchAll(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const res  = await usuariosService.listar(params)
      const data = res.data ?? res
      items.value = data.items  ?? []
      total.value = data.total  ?? 0
      pages.value = data.pages  ?? 1
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function crear(payload) {
    const res = await usuariosService.crear(payload)
    return res
  }

  async function actualizar(payload) {
    const res = await usuariosService.actualizar(payload)
    return res
  }

  async function eliminar(id) {
    const res = await usuariosService.eliminar({ id })
    return res
  }

  return { items, total, pages, loading, error, fetchAll, crear, actualizar, eliminar }
})
