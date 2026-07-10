import { api } from './api.js'

export const authService = {
  // POST /auth/login  →  { code, message, data: { access_token, expires_in, user } }
  login: (usuario, password) => api.post('/auth/login', { usuario, password }),

  // POST /auth/me  →  { code, message, data: { id, usuario, name, rol, nombre_rol } }
  me: (token) => api.post('/auth/me', { token }),
}
