export default function MetricCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={22} stroke={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-tight tabular-nums">{value}</p>
        <p className="text-sm text-gray-500 leading-tight truncate">{label}</p>
      </div>
    </div>
  )
}
