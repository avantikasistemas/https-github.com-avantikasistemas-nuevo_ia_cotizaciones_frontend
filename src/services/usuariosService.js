import { api } from './api.js'

export const usuariosService = {
  listar:     (data) => api.post('/ia-usuarios/listar',      data),
  listarDms:  (data) => api.post('/ia-usuarios/listar-dms',  data),
  crear:      (data) => api.post('/ia-usuarios/crear',       data),
  actualizar: (data) => api.post('/ia-usuarios/actualizar',  data),
  eliminar:   (data) => api.post('/ia-usuarios/eliminar',    data),
}
