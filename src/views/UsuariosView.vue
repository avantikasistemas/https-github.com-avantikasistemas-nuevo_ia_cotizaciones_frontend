<template>
  <div class="usuarios-page">

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input v-model="filtro" type="text" placeholder="Buscar usuario..." @input="onSearch" />
      </div>
      <button class="btn-primary" @click="abrirModalCrear">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Nuevo Usuario
      </button>
    </div>

    <!-- Tabla -->
    <div class="table-container">
      <div v-if="store.loading" class="state-msg">Cargando...</div>
      <div v-else-if="store.error" class="state-msg state-msg--error">{{ store.error }}</div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.items.length === 0">
            <td colspan="5" class="td-empty">Sin resultados</td>
          </tr>
          <tr v-for="u in store.items" :key="u.id">
            <td>
              <div class="user-cell">
                <span class="user-avatar">{{ initials(u.nombre_completo) }}</span>
                <div>
                  <p class="user-name">{{ u.nombre_completo }}</p>
                  <p class="user-login">{{ u.usuario }}</p>
                </div>
              </div>
            </td>
            <td><span class="badge badge--rol">{{ u.nombre_rol }}</span></td>
            <td>
              <span class="badge" :class="u.estado === 1 ? 'badge--activo' : 'badge--inactivo'">
                {{ u.estado === 1 ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="td-date">{{ formatDate(u.created_at) }}</td>
            <td>
              <div class="action-btns">
                <button class="action-btn action-btn--edit" title="Editar" @click="abrirModalEditar(u)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </button>
                <button class="action-btn action-btn--delete" title="Eliminar" @click="confirmarEliminar(u)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pagination">
      <div class="pagination-left">
        <label>Filas por página:</label>
        <select v-model="limit" @change="cargar(1)">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
      <div class="pagination-right">
        <button class="page-btn" :disabled="page === 1" @click="cargar(page - 1)">Anterior</button>
        <span>Página {{ page }} de {{ store.pages }}</span>
        <button class="page-btn" :disabled="page >= store.pages" @click="cargar(page + 1)">Siguiente</button>
      </div>
    </div>

    <!-- ══════════ MODAL CREAR ══════════ -->
    <div v-if="modalCrear" class="modal-overlay" @click.self="cerrarModalCrear">
      <div class="modal">
        <div class="modal-header">
          <h2>Nuevo Usuario</h2>
          <button class="modal-close" @click="cerrarModalCrear">✕</button>
        </div>

        <div class="modal-body">
          <!-- Dropdown buscable de usuarios DMS -->
          <div class="field">
            <label>Usuario DMS</label>
            <div class="searchable-select" ref="dmsRef">
              <div class="ss-input" @click="toggleDms">
                <span :class="{ placeholder: !crear.usuario }">
                  {{ crear.usuario || 'Seleccionar usuario DMS...' }}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="dmsOpen ? 'transform:rotate(180deg)' : ''"><path d="m6 9 6 6 6-6"/></svg>
              </div>

              <div v-if="dmsOpen" class="ss-dropdown">
                <div class="ss-search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input
                    ref="dmsSearchRef"
                    v-model="dmsQuery"
                    type="text"
                    placeholder="Buscar por usuario o nombre..."
                    @input="filtrarDms"
                  />
                </div>
                <div v-if="loadingDms" class="ss-state">Cargando...</div>
                <div v-else-if="dmsFiltrados.length === 0" class="ss-state">Sin resultados</div>
                <ul v-else class="ss-list">
                  <li
                    v-for="u in dmsFiltrados"
                    :key="u.usuario"
                    @click="seleccionarDms(u)"
                    :class="{ selected: crear.usuario === u.usuario }"
                  >
                    <span class="ss-user">{{ u.usuario }}</span>
                    <span class="ss-name">{{ u.des_usuario }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Nombre completo seleccionado -->
            <p v-if="crear.nombre_completo" class="selected-name">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {{ crear.nombre_completo }}
            </p>
            <span v-if="erroresCrear.usuario" class="field-error">{{ erroresCrear.usuario }}</span>
          </div>

          <!-- Contraseña -->
          <div class="field">
            <label>Contraseña</label>
            <div class="input-icon">
              <input
                :type="showPass ? 'text' : 'password'"
                v-model="crear.password"
                placeholder="Mínimo 6 caracteres"
              />
              <button type="button" class="eye-btn" @click="showPass = !showPass">
                <svg v-if="showPass" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <span v-if="erroresCrear.password" class="field-error">{{ erroresCrear.password }}</span>
          </div>

          <!-- Rol -->
          <div class="field">
            <label>Rol</label>
            <select v-model="crear.rol">
              <option value="" disabled>Seleccionar rol...</option>
              <option value="1">Administrador</option>
              <option value="2">Cotizador</option>
            </select>
            <span v-if="erroresCrear.rol" class="field-error">{{ erroresCrear.rol }}</span>
          </div>

          <p v-if="errorCrear" class="form-error">{{ errorCrear }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-outline" @click="cerrarModalCrear">Cancelar</button>
          <button class="btn-primary" :disabled="savingCrear" @click="guardarCrear">
            <span v-if="savingCrear" class="spinner"></span>
            {{ savingCrear ? 'Guardando...' : 'Crear Usuario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════ MODAL EDITAR ══════════ -->
    <div v-if="modalEditar" class="modal-overlay" @click.self="cerrarModalEditar">
      <div class="modal">
        <div class="modal-header">
          <h2>Editar Usuario</h2>
          <button class="modal-close" @click="cerrarModalEditar">✕</button>
        </div>

        <div class="modal-body">
          <div class="field">
            <label>Usuario</label>
            <input type="text" :value="editar.usuario" disabled class="input-disabled" />
          </div>
          <div class="field">
            <label>Nombre</label>
            <input type="text" :value="editar.nombre_completo" disabled class="input-disabled" />
          </div>

          <!-- Nueva contraseña (opcional) -->
          <div class="field">
            <label>Nueva contraseña <span class="label-opt">(dejar vacío para no cambiar)</span></label>
            <div class="input-icon">
              <input
                :type="showPassEdit ? 'text' : 'password'"
                v-model="editar.password"
                placeholder="Nueva contraseña..."
              />
              <button type="button" class="eye-btn" @click="showPassEdit = !showPassEdit">
                <svg v-if="showPassEdit" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <!-- Rol -->
          <div class="field">
            <label>Rol</label>
            <select v-model="editar.rol">
              <option value="1">Administrador</option>
              <option value="2">Cotizador</option>
            </select>
          </div>

          <!-- Estado -->
          <div class="field">
            <label>Estado</label>
            <select v-model="editar.estado">
              <option :value="1">Activo</option>
              <option :value="0">Inactivo</option>
            </select>
          </div>

          <p v-if="errorEditar" class="form-error">{{ errorEditar }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-outline" @click="cerrarModalEditar">Cancelar</button>
          <button class="btn-primary" :disabled="savingEditar" @click="guardarEditar">
            <span v-if="savingEditar" class="spinner"></span>
            {{ savingEditar ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════ CONFIRM ELIMINAR ══════════ -->
    <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
      <div class="modal modal--sm">
        <div class="modal-header">
          <h2>Eliminar Usuario</h2>
          <button class="modal-close" @click="modalEliminar = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">
            ¿Estás seguro de eliminar a <strong>{{ eliminarTarget?.nombre_completo }}</strong>?
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" @click="modalEliminar = false">Cancelar</button>
          <button class="btn-danger" :disabled="savingEliminar" @click="ejecutarEliminar">
            <span v-if="savingEliminar" class="spinner"></span>
            {{ savingEliminar ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useUsuariosStore } from '@/stores/usuarios.js'
import { usuariosService }  from '@/services/usuariosService.js'

const store = useUsuariosStore()

// ── Tabla / paginación ───────────────────────────────────────────────
const filtro = ref('')
const page   = ref(1)
const limit  = ref(10)
let   searchTimer = null

function cargar(p = 1) {
  page.value = p
  store.fetchAll({ page: p, limit: limit.value, filtro: filtro.value })
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => cargar(1), 350)
}

onMounted(() => cargar(1))

// ── Helpers ──────────────────────────────────────────────────────────
function initials(name = '') {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Modal Crear ──────────────────────────────────────────────────────
const modalCrear    = ref(false)
const savingCrear   = ref(false)
const errorCrear    = ref('')
const showPass      = ref(false)
const dmsOpen       = ref(false)
const dmsQuery      = ref('')
const dmsLista      = ref([])
const dmsFiltrados  = ref([])
const loadingDms    = ref(false)
const dmsRef        = ref(null)
const dmsSearchRef  = ref(null)

const crear = reactive({ usuario: '', nombre_completo: '', password: '', rol: '' })
const erroresCrear = reactive({ usuario: '', password: '', rol: '' })

async function abrirModalCrear() {
  Object.assign(crear, { usuario: '', nombre_completo: '', password: '', rol: '' })
  Object.assign(erroresCrear, { usuario: '', password: '', rol: '' })
  errorCrear.value = ''
  showPass.value   = false
  dmsOpen.value    = false
  dmsQuery.value   = ''
  modalCrear.value = true
  await cargarDms()
}

function cerrarModalCrear() {
  modalCrear.value = false
}

async function cargarDms() {
  loadingDms.value = true
  try {
    const res  = await usuariosService.listarDms({})
    dmsLista.value    = res.data ?? res ?? []
    dmsFiltrados.value = [...dmsLista.value]
  } catch {
    dmsLista.value = []
  } finally {
    loadingDms.value = false
  }
}

function filtrarDms() {
  const q = dmsQuery.value.toLowerCase()
  dmsFiltrados.value = q
    ? dmsLista.value.filter(u =>
        u.usuario.toLowerCase().includes(q) ||
        u.des_usuario.toLowerCase().includes(q)
      )
    : [...dmsLista.value]
}

async function toggleDms() {
  dmsOpen.value = !dmsOpen.value
  if (dmsOpen.value) {
    await nextTick()
    dmsSearchRef.value?.focus()
  }
}

function seleccionarDms(u) {
  crear.usuario         = u.usuario
  crear.nombre_completo = u.des_usuario
  dmsOpen.value         = false
  dmsQuery.value        = ''
  dmsFiltrados.value    = [...dmsLista.value]
}

// Cerrar dropdown al clic fuera
function onClickOutsideDms(e) {
  if (dmsRef.value && !dmsRef.value.contains(e.target)) dmsOpen.value = false
}
onMounted(() => document.addEventListener('click', onClickOutsideDms))

function validarCrear() {
  let ok = true
  erroresCrear.usuario  = ''
  erroresCrear.password = ''
  erroresCrear.rol      = ''
  if (!crear.usuario)  { erroresCrear.usuario  = 'Selecciona un usuario DMS.';        ok = false }
  if (crear.password.length < 6) { erroresCrear.password = 'Mínimo 6 caracteres.';   ok = false }
  if (!crear.rol)      { erroresCrear.rol      = 'Selecciona un rol.';                ok = false }
  return ok
}

async function guardarCrear() {
  if (!validarCrear()) return
  savingCrear.value = true
  errorCrear.value  = ''
  try {
    await store.crear({ usuario: crear.usuario, password: crear.password, rol: crear.rol })
    cerrarModalCrear()
    cargar(1)
  } catch (e) {
    errorCrear.value = e.message ?? 'Error al crear el usuario.'
  } finally {
    savingCrear.value = false
  }
}

// ── Modal Editar ─────────────────────────────────────────────────────
const modalEditar   = ref(false)
const savingEditar  = ref(false)
const errorEditar   = ref('')
const showPassEdit  = ref(false)
const editar        = reactive({ id: null, usuario: '', nombre_completo: '', password: '', rol: 1, estado: 1 })

function abrirModalEditar(u) {
  Object.assign(editar, { id: u.id, usuario: u.usuario, nombre_completo: u.nombre_completo, password: '', rol: u.rol, estado: u.estado })
  errorEditar.value   = ''
  showPassEdit.value  = false
  modalEditar.value   = true
}

function cerrarModalEditar() { modalEditar.value = false }

async function guardarEditar() {
  savingEditar.value = true
  errorEditar.value  = ''
  try {
    const payload = { id: editar.id, rol: editar.rol, estado: editar.estado }
    if (editar.password) payload.password = editar.password
    await store.actualizar(payload)
    cerrarModalEditar()
    cargar(page.value)
  } catch (e) {
    errorEditar.value = e.message ?? 'Error al actualizar el usuario.'
  } finally {
    savingEditar.value = false
  }
}

// ── Eliminar ─────────────────────────────────────────────────────────
const modalEliminar   = ref(false)
const savingEliminar  = ref(false)
const eliminarTarget  = ref(null)

function confirmarEliminar(u) {
  eliminarTarget.value = u
  modalEliminar.value  = true
}

async function ejecutarEliminar() {
  savingEliminar.value = true
  try {
    await store.eliminar(eliminarTarget.value.id)
    modalEliminar.value = false
    cargar(page.value)
  } finally {
    savingEliminar.value = false
  }
}
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────── */
.usuarios-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  overflow: hidden;
  padding: 20px;
  gap: 16px;
  background: #f9fafb;
}

/* ── Toolbar ─────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  width: 300px;
}

.search-box svg { color: #9ca3af; flex-shrink: 0; }
.search-box input { border: none; outline: none; font-size: 0.875rem; color: #374151; width: 100%; background: transparent; }

/* ── Tabla ───────────────────────────────────────────────── */
.table-container {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: auto;
  flex: 1;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 14px 16px;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f9fafb; }

.td-empty { text-align: center; color: #9ca3af; padding: 32px !important; }
.td-date { color: #6b7280; font-size: 0.82rem; white-space: nowrap; }

/* User cell */
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: #1e3a8a; color: #fff;
  font-size: 0.75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-name  { font-weight: 600; color: #111827; margin: 0; font-size: 0.875rem; }
.user-login { color: #6b7280; margin: 0; font-size: 0.78rem; }

/* Badges */
.badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 20px;
  font-size: 0.75rem; font-weight: 600;
}
.badge--activo   { background: #dcfce7; color: #166534; }
.badge--inactivo { background: #fee2e2; color: #991b1b; }
.badge--rol      { background: #eff6ff; color: #1e3a8a; }

/* Acciones */
.action-btns { display: flex; gap: 6px; }
.action-btn {
  width: 30px; height: 30px; border-radius: 6px;
  border: 1px solid #e5e7eb; background: #fff;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.action-btn--edit:hover   { background: #eff6ff; border-color: #bfdbfe; color: #1e3a8a; }
.action-btn--delete:hover { background: #fef2f2; border-color: #fecaca; color: #ef4444; }

/* Estado msg */
.state-msg { padding: 40px; text-align: center; color: #9ca3af; }
.state-msg--error { color: #ef4444; }

/* ── Paginación ──────────────────────────────────────────── */
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 10px; padding: 10px 16px; font-size: 0.875rem; color: #374151;
}
.pagination-left { display: flex; align-items: center; gap: 8px; }
.pagination-left select {
  border: 1px solid #e5e7eb; border-radius: 6px;
  padding: 4px 8px; font-size: 0.875rem; outline: none;
}
.pagination-right { display: flex; align-items: center; gap: 12px; }
.page-btn {
  padding: 6px 14px; border: 1px solid #e5e7eb; border-radius: 6px;
  background: #fff; cursor: pointer; font-size: 0.875rem; color: #374151;
  transition: background 0.15s;
}
.page-btn:hover:not(:disabled) { background: #f3f4f6; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Botones generales ───────────────────────────────────── */
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; background: #1e3a8a; color: #fff;
  border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; transition: background 0.15s; white-space: nowrap;
}
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-outline {
  padding: 9px 18px; background: #fff; color: #374151;
  border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 0.875rem; cursor: pointer; transition: background 0.15s;
}
.btn-outline:hover { background: #f9fafb; }

.btn-danger {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; background: #ef4444; color: #fff;
  border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
}
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Modal ───────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff; border-radius: 14px;
  width: 100%; max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex; flex-direction: column;
  max-height: 90vh; overflow: hidden;
}

.modal--sm { max-width: 380px; }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid #e5e7eb;
}
.modal-header h2 { font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0; }
.modal-close {
  background: none; border: none; cursor: pointer; color: #6b7280;
  font-size: 1rem; padding: 4px; border-radius: 4px;
}
.modal-close:hover { color: #111827; background: #f3f4f6; }

.modal-body { padding: 20px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.modal-footer {
  padding: 16px 24px; border-top: 1px solid #e5e7eb;
  display: flex; justify-content: flex-end; gap: 10px;
}

/* ── Campos ──────────────────────────────────────────────── */
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 0.875rem; font-weight: 500; color: #374151; }
.label-opt { font-weight: 400; color: #9ca3af; font-size: 0.8rem; }

.field input, .field select {
  padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 0.9rem; color: #111827; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s; background: #fff;
}
.field input:focus, .field select:focus {
  border-color: #1e3a8a; box-shadow: 0 0 0 3px rgba(30,58,138,0.1);
}
.input-disabled { background: #f9fafb !important; color: #6b7280 !important; cursor: not-allowed; }

.input-icon { position: relative; }
.input-icon input { width: 100%; box-sizing: border-box; padding-right: 40px; }
.eye-btn {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #6b7280;
  display: flex; align-items: center;
}

.field-error { font-size: 0.8rem; color: #ef4444; }
.form-error  { font-size: 0.85rem; color: #ef4444; text-align: center; margin: 0; }

.selected-name {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.85rem; color: #1e3a8a; font-weight: 500;
  background: #eff6ff; padding: 8px 12px; border-radius: 6px; margin: 0;
}

.confirm-text { font-size: 0.9rem; color: #374151; margin: 0; line-height: 1.6; }

/* ── Searchable Select ───────────────────────────────────── */
.searchable-select { position: relative; }

.ss-input {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px;
  cursor: pointer; background: #fff; font-size: 0.9rem; color: #111827;
  transition: border-color 0.15s;
}
.ss-input:hover { border-color: #9ca3af; }
.ss-input .placeholder { color: #9ca3af; }
.ss-input svg { flex-shrink: 0; color: #6b7280; transition: transform 0.2s; }

.ss-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 50; overflow: hidden;
}

.ss-search {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-bottom: 1px solid #f3f4f6;
}
.ss-search svg { color: #9ca3af; flex-shrink: 0; }
.ss-search input {
  border: none; outline: none; font-size: 0.875rem;
  color: #374151; width: 100%; background: transparent;
}

.ss-state { padding: 16px; text-align: center; color: #9ca3af; font-size: 0.875rem; }

.ss-list { list-style: none; margin: 0; padding: 4px 0; max-height: 220px; overflow-y: auto; }
.ss-list li {
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 14px; cursor: pointer; transition: background 0.1s;
}
.ss-list li:hover    { background: #f9fafb; }
.ss-list li.selected { background: #eff6ff; }

.ss-user { font-size: 0.8rem; font-weight: 600; color: #6b7280; }
.ss-name { font-size: 0.875rem; color: #111827; }

/* ── Spinner ─────────────────────────────────────────────── */
.spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
