export const PIPELINE_STAGES = [
  {
    id: 'pending_ai_analysis',
    label: 'Análisis IA Pendiente',
    description: 'Solicitudes en espera de análisis por IA',
  },
  {
    id: 'pending_human_review',
    label: 'Revisión Humana',
    description: 'Requiere revisión manual',
  },
  {
    id: 'quote_pending',
    label: 'Cotización Pendiente',
    description: 'En espera de generación de cotización',
  },
  {
    id: 'quote_ready',
    label: 'Cotización Lista',
    description: 'Cotizaciones listas para enviar',
  },
  {
    id: 'quote_sent',
    label: 'Cotización Enviada',
    description: 'Cotizaciones enviadas al cliente',
  },
]
