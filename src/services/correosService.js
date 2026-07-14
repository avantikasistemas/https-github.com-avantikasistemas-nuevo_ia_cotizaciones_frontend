import { api } from './api.js'

export const correosService = {
  listar:  (data) => api.post('/correos/listar',  data),
  detalle: (data) => api.post('/correos/detalle', data),
}
