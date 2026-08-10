import { IconClock, IconCoin, IconMessage, IconHandGrab } from '@tabler/icons-react'
import { TEMPERATURES } from '../utils/temperature'
import { timeAgo } from '../utils/time'

export default function LeadCard({ lead, isSelected, onSelect, onGrab }) {
  const t = TEMPERATURES[lead.temperatura]
  const lastMessage = lead.messages?.[lead.messages.length - 1]
  const isGrabbed = lead.status && lead.status.startsWith('pegado')

  return (
    <div
      onClick={() => onSelect(lead)}
      className={`cursor-pointer rounded-xl border-2 p-4 transition-all bg-white hover:shadow-md ${
        isSelected ? 'border-gray-900 shadow-md' : `${t.border}`
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-lg leading-none">{t.emoji}</span>
            <h3 className="font-semibold text-gray-900 text-base truncate">{lead.nome}</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1 truncate">
            <IconMessage size={15} className="shrink-0 text-gray-400" />
            {lead.interesse}
          </p>
        </div>
        {isGrabbed && (
          <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
            Pegado
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {lead.preco && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
            <IconCoin size={15} />
            {lead.preco}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <IconClock size={14} />
          {timeAgo(lead.data_criacao)}
        </span>
      </div>

      {lastMessage && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2 bg-gray-50 rounded-lg px-3 py-2">
          <span className="font-medium text-gray-600">
            {lastMessage.sender === 'cliente' ? lead.nome.split(' ')[0] : lastMessage.sender === 'bot' ? 'Bot' : 'Você'}:
          </span>{' '}
          {lastMessage.conteudo}
        </p>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation()
          onGrab(lead)
        }}
        disabled={isGrabbed}
        className={`mt-3 w-full min-h-[44px] rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
          isGrabbed
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950'
        }`}
      >
        <IconHandGrab size={18} />
        {isGrabbed ? 'Lead já pego' : 'PEGAR LEAD'}
      </button>
    </div>
  )
}
