import { IconFlame, IconCalendar, IconWifi, IconWifiOff } from '@tabler/icons-react'

const FILTERS = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' }
]

export default function Header({ period, onPeriodChange, isLive, search, onSearchChange }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <IconFlame className="text-white" size={22} stroke={1.75} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">ORVION</h1>
              <p className="text-xs text-gray-500 leading-tight">Dashboard de Leads</p>
            </div>
          </div>

          <span
            className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
              isLive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
            }`}
            title={isLive ? 'Conectado ao Supabase em tempo real' : 'Modo demonstração (dados fake)'}
          >
            {isLive ? <IconWifi size={14} /> : <IconWifiOff size={14} />}
            {isLive ? 'Ao vivo' : 'Demo'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => onPeriodChange(f.key)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 rounded-md text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 ${
                  period === f.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconCalendar size={16} className="sm:hidden" />
                {f.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar lead por nome..."
            className="w-full sm:w-56 min-h-[44px] sm:min-h-0 px-3 py-2 text-base sm:text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
          />
        </div>
      </div>
    </header>
  )
}
