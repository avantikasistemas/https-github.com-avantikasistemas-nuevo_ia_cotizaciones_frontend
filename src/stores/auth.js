import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/authService.js'

function safeParse(val) {
  try { return JSON.parse(val) } catch { return null }
}

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ───────────────────────────────────────────────────────────
  const token     = ref(localStorage.getItem('auth_token') ?? null)
  const user      = ref(safeParse(localStorage.getItem('auth_user')))
  const expiresAt = ref(Number(localStorage.getItem('auth_expires')) || 0)

  // ── Getters ──────────────────────────────────────────────────────────
  const isTokenExpired  = computed(() => expiresAt.value > 0 && Date.now() > expiresAt.value)
  const isAuthenticated = computed(() => !!token.value && !isTokenExpired.value)

  // ── Acciones ─────────────────────────────────────────────────────────
  async function login(usuario, password) {
    const res = await authService.login(usuario, password)
    // El backend envuelve en { code, message, data }
    const data = res.data ?? res

    token.value     = data.access_token
    user.value      = data.user
    expiresAt.value = Date.now() + (data.expires_in ?? 54000) * 1000  // expires_in en segundos

    localStorage.setItem('auth_token',   data.access_token)
    localStorage.setItem('auth_user',    JSON.stringify(data.user))
    localStorage.setItem('auth_expires', String(expiresAt.value))
  }

  function logout() {
    token.value     = null
    user.value      = null
    expiresAt.value = 0
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_expires')
  }

  return { token, user, expiresAt, isAuthenticated, isTokenExpired, login, logout }
})
