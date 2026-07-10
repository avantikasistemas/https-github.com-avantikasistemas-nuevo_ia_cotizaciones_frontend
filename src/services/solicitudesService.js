import { api } from './api.js'

export const solicitudesService = {
  // TODO: reemplazar mocks con llamadas reales al backend FastAPI
  getAll:    ()         => api.get('/solicitudes'),
  getById:   (id)       => api.get(`/solicitudes/${id}`),
  create:    (payload)  => api.post('/solicitudes', payload),
  update:    (id, data) => api.patch(`/solicitudes/${id}`, data),
  updateStatus: (id, status) => api.patch(`/solicitudes/${id}/status`, { status }),
  remove:    (id)       => api.delete(`/solicitudes/${id}`),
}
