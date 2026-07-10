const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function clearSessionAndRedirect() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  localStorage.removeItem('auth_expires')
  window.location.href = '/login'
}

async function request(path, options = {}) {
  const token = localStorage.getItem('auth_token')

  // Verificar expiración antes de enviar la petición
  const expires = Number(localStorage.getItem('auth_expires') || 0)
  if (token && expires > 0 && Date.now() > expires) {
    clearSessionAndRedirect()
    return
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // Token expirado / no autorizado → redirigir al login
  if (res.status === 401) {
    clearSessionAndRedirect()
    return
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    const err   = new Error(error.detail ?? error.message ?? 'Error inesperado')
    err.status  = res.status
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get:    (path, opts)       => request(path, { ...opts, method: 'GET' }),
  post:   (path, body, opts) => request(path, { ...opts, method: 'POST',  body: JSON.stringify(body) }),
  put:    (path, body, opts) => request(path, { ...opts, method: 'PUT',   body: JSON.stringify(body) }),
  patch:  (path, body, opts) => request(path, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path, opts)       => request(path, { ...opts, method: 'DELETE' }),
}
