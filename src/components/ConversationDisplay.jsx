import { IconMessageCircle, IconPhone, IconCoin, IconHandGrab, IconRobot, IconUser, IconHeadset } from '@tabler/icons-react'
import { TEMPERATURES } from '../utils/temperature'
import { formatClock, timeAgo } from '../utils/time'

const SENDER_STYLE = {
  cliente: {
    align: 'justify-start',
    bubble: 'bg-white border border-gray-200 text-gray-900',
    icon: IconUser,
    label: 'Cliente'
  },
  bot: {
    align: 'justify-end',
    bubble: 'bg-gray-900 text-white',
    icon: IconRobot,
    label: 'Bot'
  },
  vendedor: {
    align: 'justify-end',
    bubble: 'bg-emerald-600 text-white',
    icon: IconHeadset,
    label: 'Você'
  }
}

export default function ConversationDisplay({ lead, onGrab }) {
  if (!lead) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16">
        <IconMessageCircle size={40} stroke={1.5} />
        <p className="mt-3 text-sm">Selecione um lead para ver a conversa</p>
      </div>
    )
  }

  const t = TEMPERATURES[lead.temperatura]
  const isGrabbed = lead.status && lead.status.startsWith('pegado')

  return (
    <div className="flex flex-col h-full">
      <div className="pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {lead.nome}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.badge}`}>
                {t.emoji} {t.label}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <IconPhone size={14} /> {lead.telefone}
            </p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(lead.data_criacao)}</span>
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-sm text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg">{lead.interesse}</span>
          {lead.preco && (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
              <IconCoin size={16} /> {lead.preco}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {lead.messages?.map((m, idx) => {
          const style = SENDER_STYLE[m.sender] || SENDER_STYLE.cliente
          return (
            <div key={idx} className={`flex ${style.align}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-base leading-relaxed ${style.bubble}`}>
                <p>{m.conteudo}</p>
                <p className={`text-[11px] mt-1 opacity-70`}>{formatClock(m.timestamp)}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-gray-100">
        <button
          onClick={() => onGrab(lead)}
          disabled={isGrabbed}
          className={`w-full min-h-[48px] rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors ${
            isGrabbed
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950'
          }`}
        >
          <IconHandGrab size={20} />
          {isGrabbed ? `Lead pego (${lead.status.replace('pegado_por_', '')})` : 'PEGAR LEAD'}
        </button>
      </div>
    </div>
  )
}
