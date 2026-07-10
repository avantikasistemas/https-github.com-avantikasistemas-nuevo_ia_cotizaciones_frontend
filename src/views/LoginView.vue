<template>
  <div class="login-page">
    <!-- Logo superior izquierdo -->
    <div class="logo-wrapper">
      <img src="@/assets/logo.png" alt="Avantika" class="logo" />
    </div>

    <!-- Tarjeta de login centrada -->
    <div class="card">
      <h1 class="title">Bienvenido de nuevo!</h1>

      <form @submit.prevent="handleLogin" novalidate>
        <!-- Usuario DMS -->
        <div class="field">
          <label for="username">Usuario DMS</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="usuario.dms"
            autocomplete="username"
            :class="{ error: errors.username }"
          />
          <span v-if="errors.username" class="field-error">{{ errors.username }}</span>
        </div>

        <!-- Contraseña -->
        <div class="field">
          <label for="password">Contraseña</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              :class="{ error: errors.password }"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <!-- Error general del servidor -->
        <p v-if="loginError" class="login-error">{{ loginError }}</p>

        <!-- Botón submit -->
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}</span>
        </button>
      </form>
    </div>

    <!-- Blob decorativo inferior -->
    <div class="blob" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router    = useRouter()
const authStore = useAuthStore()

const form = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })
const showPassword = ref(false)
const loading      = ref(false)
const loginError   = ref('')

function validate() {
  errors.username = ''
  errors.password = ''
  let ok = true
  if (!form.username.trim()) {
    errors.username = 'El usuario DMS es requerido'
    ok = false
  }
  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    ok = false
  }
  return ok
}

async function handleLogin() {
  loginError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await authStore.login(form.username.trim(), form.password)
    router.push({ name: 'solicitudes' })
  } catch (err) {
    if (err.status === 401) {
      loginError.value = 'Usuario o contraseña incorrectos.'
    } else {
      loginError.value = err.message ?? 'No se pudo conectar con el servidor.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Layout base ─────────────────────────────────────────── */
.login-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ── Logo ────────────────────────────────────────────────── */
.logo-wrapper {
  position: absolute;
  top: 28px;
  left: 32px;
}

.logo {
  height: 48px;
  width: auto;
  object-fit: contain;
}

/* ── Tarjeta ─────────────────────────────────────────────── */
.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.10);
  padding: 40px 44px 36px;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 28px;
  text-align: center;
}

/* ── Campos ──────────────────────────────────────────────── */
.field {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #111827;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  background: #fff;
}

.field input::placeholder {
  color: #9ca3af;
}

.field input:focus {
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.12);
}

.field input.error {
  border-color: #ef4444;
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
}

/* ── Input con ícono de ojo ──────────────────────────────── */
.input-wrapper {
  position: relative;
}

.input-wrapper input {
  padding-right: 42px;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.eye-btn:hover {
  color: #374151;
}

/* ── Error general ───────────────────────────────────────── */
.login-error {
  font-size: 0.875rem;
  color: #ef4444;
  text-align: center;
  margin: -4px 0 14px;
}

/* ── Botón submit ────────────────────────────────────────── */
.btn-submit {
  width: 100%;
  padding: 12px;
  background: #1e3a8a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  background: #1e40af;
}

.btn-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ── Spinner ─────────────────────────────────────────────── */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Blob decorativo ─────────────────────────────────────── */
.blob {
  position: absolute;
  bottom: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(167, 139, 250, 0.35) 0%, rgba(196, 181, 253, 0.20) 50%, transparent 75%);
  pointer-events: none;
  z-index: 0;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 480px) {
  .card {
    margin: 0 16px;
    padding: 32px 24px 28px;
  }

  .logo-wrapper {
    top: 20px;
    left: 20px;
  }
}
</style>
