import { useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import LeadCard from './LeadCard'
import { TEMPERATURES, TEMPERATURE_ORDER } from '../utils/temperature'

export default function LeadList({ leads, selectedLead, onSelect, onGrab, activeFilter, onFilterChange }) {
  const [collapsed, setCollapsed] = useState({})

  const filtered = activeFilter === 'todos' ? leads : leads.filter((l) => l.temperatura === activeFilter)

  const grouped = TEMPERATURE_ORDER.map((key) => ({
    key,
    items: filtered.filter((l) => l.temperatura === key)
  })).filter((g) => g.items.length > 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 px-1 pb-3 overflow-x-auto">
        <FilterPill active={activeFilter === 'todos'} onClick={() => onFilterChange('todos')} label="Todos" count={leads.length} />
        {TEMPERATURE_ORDER.map((key) => (
          <FilterPill
            key={key}
            active={activeFilter === key}
            onClick={() => onFilterChange(key)}
            label={`${TEMPERATURES[key].emoji} ${TEMPERATURES[key].label}`}
            count={leads.filter((l) => l.temperatura === key).length}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {grouped.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">Nenhum lead encontrado.</p>
        )}
        {grouped.map(({ key, items }) => {
          const t = TEMPERATURES[key]
          const isCollapsed = collapsed[key]
          return (
            <div key={key}>
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [key]: !c[key] }))}
                className="w-full flex items-center justify-between mb-2 px-1"
              >
                <span className={`text-sm font-bold tracking-wide ${t.text}`}>
                  {t.emoji} {t.label} ({items.length})
                </span>
                <IconChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                />
              </button>
              {!isCollapsed && (
                <div className="space-y-3">
                  {items.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      isSelected={selectedLead?.id === lead.id}
                      onSelect={onSelect}
                      onGrab={onGrab}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FilterPill({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 min-h-[40px] px-3.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 ${
        active
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
      <span
        className={`text-xs rounded-full px-1.5 py-0.5 ${
          active ? 'bg-white/20' : 'bg-gray-100'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
