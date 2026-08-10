// Dados fake para demonstração do dashboard ORVION (negócio: consultório estético)

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString()

export const fakeBusiness = {
  id: 'biz-1',
  nome: 'Espaço Bella Estética',
  segmento: 'Beleza & Estética',
  faq: 'Botox, preenchimento, limpeza de pele, drenagem linfática, peeling.',
  horario: 'Seg-Sex 9h-19h, Sáb 9h-14h',
  localizacao: 'Av. Paulista, 1200 - São Paulo/SP'
}

function msg(sender, conteudo, minsAgoValue) {
  return { sender, conteudo, timestamp: minutesAgo(minsAgoValue) }
}

export const fakeLeads = [
  // 🔴 QUENTES (3)
  {
    id: 'lead-1',
    nome: 'Juliana Almeida',
    telefone: '11 99811-2233',
    interesse: 'Botox (testa e olhos)',
    preco: 'R$ 890',
    temperatura: 'quente',
    status: 'aberto',
    data_criacao: hoursAgo(2),
    messages: [
      msg('cliente', 'Oi, vi o anúncio de vocês. Quanto custa o botox?', 130),
      msg('bot', 'Olá Juliana! O botox para testa e olhos sai por R$ 890. Quer agendar uma avaliação gratuita?', 128),
      msg('cliente', 'Quero sim! Vocês tem horário essa semana?', 125),
      msg('bot', 'Temos! Quinta às 15h ou sexta às 10h. Qual prefere?', 123),
      msg('cliente', 'Quinta às 15h fica ótimo, pode confirmar', 15)
    ]
  },
  {
    id: 'lead-2',
    nome: 'Marcos Ferreira',
    telefone: '11 98765-4321',
    interesse: 'Preenchimento labial',
    preco: 'R$ 1.200',
    temperatura: 'quente',
    status: 'aberto',
    data_criacao: hoursAgo(4),
    messages: [
      msg('cliente', 'Bom dia, gostaria de saber sobre preenchimento labial', 260),
      msg('bot', 'Bom dia Marcos! O preenchimento labial custa R$ 1.200 e o resultado dura em média 8 meses.', 258),
      msg('cliente', 'Perfeito, quero marcar. Aceita cartão parcelado?', 250),
      msg('bot', 'Aceitamos em até 6x sem juros! Vou te conectar com nossa atendente para fechar o agendamento 😊', 248)
    ]
  },
  {
    id: 'lead-3',
    nome: 'Camila Rodrigues',
    telefone: '11 97654-3210',
    interesse: 'Pacote limpeza de pele + peeling',
    preco: 'R$ 450',
    temperatura: 'quente',
    status: 'aberto',
    data_criacao: minutesAgo(40),
    messages: [
      msg('cliente', 'Olá! Vi que vocês fazem pacote de limpeza de pele com peeling', 38),
      msg('bot', 'Isso mesmo Camila! O pacote sai R$ 450 e inclui 2 sessões. Quer que eu verifique horários disponíveis?', 36),
      msg('cliente', 'Sim, por favor! Prefiro no período da tarde', 20),
      msg('bot', 'Encontrei terça às 14h. Confirma?', 18),
      msg('cliente', 'Perfeito, confirmado!', 5)
    ]
  },

  // 🟡 MORNOS (5)
  {
    id: 'lead-4',
    nome: 'Pedro Costa',
    telefone: '11 91234-5678',
    interesse: 'Perguntou preço de drenagem linfática',
    preco: 'R$ 180',
    temperatura: 'morno',
    status: 'aberto',
    data_criacao: hoursAgo(6),
    messages: [
      msg('cliente', 'Quanto custa a drenagem linfática?', 370),
      msg('bot', 'Olá Pedro! A sessão de drenagem linfática custa R$ 180. Quer agendar?', 368),
      msg('cliente', 'Vou ver minha agenda e te falo', 360)
    ]
  },
  {
    id: 'lead-5',
    nome: 'Ana Souza',
    telefone: '11 99222-1144',
    interesse: 'Botox - dúvida sobre dor',
    temperatura: 'morno',
    status: 'aberto',
    data_criacao: hoursAgo(8),
    messages: [
      msg('cliente', 'Botox dói muito?', 490),
      msg('bot', 'Oi Ana! A maioria das clientes relata desconforto leve, bem tolerável. Usamos anestésico tópico antes de aplicar 🙂', 488),
      msg('cliente', 'Ah que bom, vou pensar', 480)
    ]
  },
  {
    id: 'lead-6',
    nome: 'Rafael Lima',
    telefone: '11 98888-7766',
    interesse: 'Perguntou sobre peeling de diamante',
    preco: 'R$ 220',
    temperatura: 'morno',
    status: 'aberto',
    data_criacao: hoursAgo(10),
    messages: [
      msg('cliente', 'Vocês fazem peeling de diamante?', 610),
      msg('bot', 'Fazemos sim! A sessão custa R$ 220. Quer conhecer mais sobre o procedimento?', 608),
      msg('cliente', 'Quero, me manda mais informações', 600)
    ]
  },
  {
    id: 'lead-7',
    nome: 'Beatriz Nunes',
    telefone: '11 97777-6655',
    interesse: 'Comparando preços de preenchimento',
    temperatura: 'morno',
    status: 'aberto',
    data_criacao: hoursAgo(12),
    messages: [
      msg('cliente', 'Oi, quanto fica o preenchimento de olheiras?', 730),
      msg('bot', 'Olá Beatriz! O preenchimento de olheiras custa a partir de R$ 950, dependendo da quantidade necessária.', 728),
      msg('cliente', 'Entendi, vou comparar com outro lugar', 720)
    ]
  },
  {
    id: 'lead-8',
    nome: 'Diego Martins',
    telefone: '11 96666-5544',
    interesse: 'Perguntou horário de funcionamento',
    temperatura: 'morno',
    status: 'aberto',
    data_criacao: hoursAgo(14),
    messages: [
      msg('cliente', 'Vocês abrem aos sábados?', 850),
      msg('bot', 'Sim! Abrimos sábado das 9h às 14h. Posso te ajudar com algum agendamento?', 848),
      msg('cliente', 'Só tava confirmando, obrigado', 845)
    ]
  },

  // ⚪ FRIOS (8)
  {
    id: 'lead-9',
    nome: 'Fernanda Oliveira',
    telefone: '11 95555-4433',
    interesse: 'Perguntou se atende convênio',
    temperatura: 'frio',
    status: 'aberto',
    data_criacao: hoursAgo(20),
    messages: [
      msg('cliente', 'Vocês atendem por convênio?', 1210),
      msg('bot', 'No momento trabalhamos apenas com pagamento particular, Fernanda. Mas parcelamos em até 6x!', 1208)
    ]
  },
  {
    id: 'lead-10',
    nome: 'Lucas Pereira',
    telefone: '11 94444-3322',
    interesse: 'Só pediu localização',
    temperatura: 'frio',
    status: 'aberto',
    data_criacao: hoursAgo(24),
    messages: [
      msg('cliente', 'Onde fica o consultório?', 1450),
      msg('bot', 'Ficamos na Av. Paulista, 1200 - São Paulo/SP. Fica perto do metrô Trianon-MASP!', 1448)
    ]
  },
  {
    id: 'lead-11',
    nome: 'Patrícia Gomes',
    telefone: '11 93333-2211',
    interesse: 'Perguntou sobre botox, sumiu',
    temperatura: 'frio',
    status: 'aberto',
    data_criacao: hoursAgo(30),
    messages: [
      msg('cliente', 'Quanto custa botox?', 1810),
      msg('bot', 'Olá Patrícia! O botox custa a partir de R$ 890. Posso te ajudar a agendar uma avaliação?', 1808)
    ]
  },
  {
    id: 'lead-12',
    nome: 'Thiago Almeida',
    telefone: '11 92222-1100',
    interesse: 'Mensagem automática sem resposta',
    temperatura: 'frio',
    status: 'aberto',
    data_criacao: hoursAgo(36),
    messages: [
      msg('cliente', 'Oi', 2170),
      msg('bot', 'Olá! Bem-vindo ao Espaço Bella Estética 😊 Como posso te ajudar hoje?', 2168)
    ]
  },
  {
    id: 'lead-13',
    nome: 'Vanessa Ribeiro',
    telefone: '11 91111-0099',
    interesse: 'Perguntou sobre limpeza de pele',
    temperatura: 'frio',
    status: 'aberto',
    data_criacao: hoursAgo(48),
    messages: [
      msg('cliente', 'Fazem limpeza de pele?', 2890),
      msg('bot', 'Fazemos sim! A sessão custa R$ 250. Quer agendar?', 2888)
    ]
  },
  {
    id: 'lead-14',
    nome: 'Bruno Cardoso',
    telefone: '11 90000-9988',
    interesse: 'Reclamação sobre horário',
    temperatura: 'frio',
    status: 'aberto',
    data_criacao: hoursAgo(52),
    messages: [
      msg('cliente', 'Cheguei e estava fechado no horário que vocês passaram', 3130),
      msg('bot', 'Poxa, sentimos muito Bruno! Vou repassar para nossa equipe verificar o que aconteceu.', 3128)
    ]
  },
  {
    id: 'lead-15',
    nome: 'Larissa Teixeira',
    telefone: '11 98123-4567',
    interesse: 'Só curtiu o anúncio, sem interação',
    temperatura: 'frio',
    status: 'aberto',
    data_criacao: hoursAgo(60),
    messages: [
      msg('cliente', 'Vi o post de vocês no Instagram', 3610),
      msg('bot', 'Que bom, Larissa! Posso te ajudar com alguma informação sobre nossos procedimentos?', 3608)
    ]
  },
  {
    id: 'lead-16',
    nome: 'Gustavo Barros',
    telefone: '11 97012-3456',
    interesse: 'Perguntou preço e nunca voltou',
    temperatura: 'frio',
    status: 'aberto',
    data_criacao: hoursAgo(70),
    messages: [
      msg('cliente', 'Quanto custa a drenagem?', 4210),
      msg('bot', 'A sessão de drenagem linfática custa R$ 180, Gustavo. Quer agendar um horário?', 4208)
    ]
  }
]
