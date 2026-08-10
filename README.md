# ORVION Dashboard

Dashboard React responsivo para gestão de leads de WhatsApp, com integração Supabase (dados + real-time).

## Rodando localmente

```bash
npm install
cp .env.example .env
# edite .env com sua URL e chave anon do Supabase
npm run dev
```

Abra http://localhost:3000

Sem configurar o `.env`, o dashboard funciona em **modo demonstração**, usando os dados fake em [`src/data/fakeData.js`](src/data/fakeData.js) (3 leads quentes, 5 mornos, 8 frios, com conversas de exemplo de um consultório estético).

## Setup do Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e rode o script [`supabase/schema.sql`](supabase/schema.sql) — ele cria as tabelas `businesses`, `leads` e `messages`, habilita realtime e insere alguns dados de exemplo
3. Em **Settings → API**, copie a **Project URL** e a chave **anon public**
4. Cole essas duas no arquivo `.env`:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLIC
```

5. Reinicie `npm run dev`

Com o Supabase configurado, o header mostra "Ao vivo" e o dashboard passa a:
- carregar leads e mensagens reais das tabelas
- escutar `postgres_changes` e atualizar a tela automaticamente quando um novo lead ou mensagem chega
- persistir o clique em **PEGAR LEAD** (`status` vira `pegado_por_voce`) direto na tabela `leads`

## Estrutura

```
src/
  components/   Header, MetricCard, MetricsRow, LeadCard, LeadList, ConversationDisplay
  data/         fakeData.js (dados de demonstração)
  utils/        temperature.js, time.js
  supabaseClient.js
  App.jsx
supabase/
  schema.sql    tabelas + realtime + seed
```

## Próximos passos

Depois de validar o dashboard, conecte o n8n para escrever direto nas tabelas `leads`/`messages` conforme o bot do WhatsApp (Evolution API) conversa com os clientes — o dashboard atualiza sozinho via realtime.
