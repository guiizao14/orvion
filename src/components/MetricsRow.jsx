import { IconMessage2, IconRobot, IconTarget, IconClockHour4 } from '@tabler/icons-react'
import MetricCard from './MetricCard'

export default function MetricsRow({ metrics }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard icon={IconMessage2} label="Mensagens recebidas" value={metrics.totalMessages} accent="#3B82F6" />
      <MetricCard icon={IconRobot} label="Bot respondeu" value={metrics.botReplies} accent="#8B5CF6" />
      <MetricCard icon={IconTarget} label="Leads qualificados" value={metrics.qualifiedLeads} accent="#EF4444" />
      <MetricCard icon={IconClockHour4} label="Tempo economizado" value={metrics.timeSaved} accent="#10B981" />
    </div>
  )
}
