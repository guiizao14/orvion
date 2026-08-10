import { useEffect, useMemo, useState, useCallback } from 'react'
import Header from './components/Header'
import MetricsRow from './components/MetricsRow'
import LeadList from './components/LeadList'
import ConversationDisplay from './components/ConversationDisplay'
import { fakeLeads } from './data/fakeData'
import { supabase, isSupabaseConfigured } from './supabaseClient'

const VENDEDOR = 'voce'

export default function App() {
  const [leads, setLeads] = useState(fakeLeads)
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [period, setPeriod] = useState('hoje')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')
  const [isLive, setIsLive] = useState(false)

  // Carrega dados reais do Supabase (se configurado), com fallback para os dados fake
  useEffect(() => {
    if (!isSupabaseConfigured) return

    let cancelled = false

    async function loadFromSupabase() {
      const { data: leadRows, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('data_criacao', { ascending: false })

      if (leadsError || !leadRows || leadRows.length === 0) {
        console.warn('Supabase sem leads ainda, usando dados fake para demonstração.', leadsError)
        return
      }

      const { data: messageRows } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true })

      const merged = leadRows.map((lead) => ({
        ...lead,
        messages: (messageRows || []).filter((m) => m.lead_id === lead.id)
      }))

      if (!cancelled) {
        setLeads(merged)
        setIsLive(true)
      }
    }

    loadFromSupabase()

    const channel = supabase
      .channel('orvion-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        setLeads((prev) => {
          if (payload.eventType === 'INSERT') {
            return [{ ...payload.new, messages: [] }, ...prev]
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map((l) => (l.id === payload.new.id ? { ...l, ...payload.new } : l))
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter((l) => l.id !== payload.old.id)
          }
          return prev
        })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === payload.new.lead_id
              ? { ...l, messages: [...(l.messages || []), payload.new] }
              : l
          )
        )
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  const handleGrab = useCallback(async (lead) => {
    const newStatus = `pegado_por_${VENDEDOR}`

    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l)))

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, atualizado_em: new Date().toISOString() })
        .eq('id', lead.id)

      if (error) console.error('Erro ao atualizar lead no Supabase:', error)
    }
  }, [])

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads
    const q = search.toLowerCase()
    return leads.filter((l) => l.nome.toLowerCase().includes(q))
  }, [leads, search])

  const selectedLead = useMemo(
    () => filteredLeads.find((l) => l.id === selectedLeadId) || null,
    [filteredLeads, selectedLeadId]
  )

  const metrics = useMemo(() => {
    const totalMessages = leads.reduce((sum, l) => sum + (l.messages?.length || 0), 0)
    const botReplies = leads.reduce(
      (sum, l) => sum + (l.messages?.filter((m) => m.sender === 'bot').length || 0),
      0
    )
    const qualifiedLeads = leads.filter((l) => l.temperatura === 'quente' || l.temperatura === 'morno').length
    const minutesSaved = botReplies * 3
    const timeSaved = `${Math.floor(minutesSaved / 60)}h${String(minutesSaved % 60).padStart(2, '0')}`

    return { totalMessages, botReplies, qualifiedLeads, timeSaved }
  }, [leads])

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header
        period={period}
        onPeriodChange={setPeriod}
        isLive={isLive}
        search={search}
        onSearchChange={setSearch}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        <MetricsRow metrics={metrics} />

        <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-0">
          <section className="lg:w-[30%] bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col lg:max-h-[calc(100vh-220px)]">
            <LeadList
              leads={filteredLeads}
              selectedLead={selectedLead}
              onSelect={(lead) => setSelectedLeadId(lead.id)}
              onGrab={handleGrab}
              activeFilter={filter}
              onFilterChange={setFilter}
            />
          </section>

          <section className="lg:w-[70%] bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 flex flex-col lg:max-h-[calc(100vh-220px)]">
            <ConversationDisplay lead={selectedLead} onGrab={handleGrab} />
          </section>
        </div>
      </main>
    </div>
  )
}
