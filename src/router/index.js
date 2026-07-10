import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

import LoginView      from '@/views/LoginView.vue'
import AppLayout      from '@/layouts/AppLayout.vue'
import SolicitudesView from '@/views/SolicitudesView.vue'

// Vistas futuras (lazy-loaded)
const ClientesView  = () => import('@/views/ClientesView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const CorreosView   = () => import('@/views/CorreosView.vue')
const UsuariosView  = () => import('@/views/UsuariosView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',      redirect: '/solicitudes' },
    { path: '/login', name: 'login', component: LoginView },

    // Rutas autenticadas bajo el AppLayout
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'solicitudes', name: 'solicitudes', component: SolicitudesView },
        { path: 'clientes',    name: 'clientes',    component: ClientesView    },
        { path: 'dashboard',   name: 'dashboard',   component: DashboardView   },
        { path: 'correos',     name: 'correos',     component: CorreosView     },
        { path: 'usuarios',    name: 'usuarios',    component: UsuariosView    },
      ],
    },
  ],
  scrollBehavior() { return { top: 0 } },
})

// Guard global: verifica autenticación y expiración de token en cada navegación
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      auth.logout() // limpia localStorage si el token expiró
      return { name: 'login' }
    }
  }

  // Ya autenticado intentando ir al login → redirigir a solicitudes
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'solicitudes' }
  }
})

export default router
