export const TEMPERATURES = {
  quente: {
    label: 'QUENTE',
    emoji: '🔴',
    color: '#EF4444',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    badge: 'bg-red-100 text-red-700'
  },
  morno: {
    label: 'MORNO',
    emoji: '🟡',
    color: '#F59E0B',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700'
  },
  frio: {
    label: 'FRIO',
    emoji: '⚪',
    color: '#9CA3AF',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-500',
    badge: 'bg-gray-100 text-gray-600'
  }
}

export const TEMPERATURE_ORDER = ['quente', 'morno', 'frio']
