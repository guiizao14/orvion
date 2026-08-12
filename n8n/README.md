# ORVION — Agente FAQ (n8n + GPT-4o Mini)

Bot que responde as perguntas repetitivas do WhatsApp de um negócio local, **sai do caminho
quando o vendedor assume a conversa**, classifica o lead (quente/morno/frio) e joga tudo no
dashboard ORVION. Produto pensado para vender como assinatura mensal.

Arquivo para importar: [`orvion-agente-faq.json`](orvion-agente-faq.json)

---

## O problema do número único (e como o workflow resolve)

Pequeno negócio tem **um** número de WhatsApp. O bot e o dono usam o mesmo número. Sem
proteção, acontece isso:

```
Cliente:  Qual o horário?
Bot:      Terça a domingo, 18h às 23h30
Cliente:  E na segunda?
          [dono está digitando uma resposta melhor no celular]
Bot:      Segunda fechado          ← atropelou o dono
Dono:     Segunda fechado, mas dá pra encomendar    ← saiu duplicado
```

O workflow tem três mecanismos contra isso:

**1. Reconhece o eco do próprio bot.** Toda mensagem que sai do número volta no webhook com
`fromMe: true` — tanto a do bot quanto a que o dono digitou no celular. O workflow guarda o
`id` e o texto de cada mensagem que enviou; quando ela volta, é ignorada. Se voltar um
`fromMe` que **não** está nessa lista, foi um humano digitando.

**2. Pausa quando o humano fala.** Detectada uma mensagem do vendedor, o bot fica calado
naquela conversa por **30 minutos** (`pausa_humano_minutos`). As mensagens do cliente nesse
período continuam sendo salvas no dashboard, só não são respondidas. Cada nova mensagem do
vendedor renova a pausa.

**3. Janela de espera antes de responder.** Antes de mandar a resposta, o bot espera
**8 segundos** (`janela_espera_segundos`) e confere de novo se um humano entrou. Isso cobre
exatamente o caso que você levantou: o vendedor começou a digitar e o bot ia falar primeiro.
Bônus: 8 segundos de "digitando" deixa a resposta bem menos robótica.

Resultado com a proteção ligada:

```
Cliente:  Qual o horário?
Bot:      Terça a domingo, 18h às 23h30
Cliente:  E na segunda?
Dono:     Segunda fechado, mas dá pra encomendar    ← dono respondeu na janela de 8s
Bot:      [fica calado — e continua calado pelos próximos 30 min]
```

---

## Como o workflow funciona

```
Chat Trigger (teste)  ─┐
                       ├→ Config do Cliente → Normalizar Entrada → Guardião → [Bot pode falar?]
Webhook Evolution ─────┘                                                          │
   (desabilitado)                                                     não ────────┤
                                                                                  │ sim
   Supabase: Registrar Sem Resposta → Bot em Silêncio  ←───────────────────────────┘
                                                                                  │
                          Janela de 8s → Reconferir Vendedor → [Vendedor não entrou?]
                                                                       │           │
                                                          não → Vendedor Entrou    │ sim
                                                                                   │
   Agente FAQ → Classificar Lead → Processar → Supabase → Resposta → Enviar WhatsApp
   (gpt-4o-mini + memória)   (gpt-4o-mini, JSON)      (desabilitado)   (desabilitado)
```

| Node | O que faz |
|---|---|
| **Chat Trigger (teste)** | Chat dentro do n8n para testar digitando |
| **Webhook Evolution API** | *(desabilitado)* Recebe as mensagens reais do WhatsApp |
| **Config do Cliente** | **O único node que você edita por cliente** |
| **Normalizar Entrada** | Padroniza os dois formatos e decide se a mensagem é do `cliente`, do `vendedor` ou eco do próprio bot. Ignora grupos, áudio e sticker |
| **Guardião do Atendimento** | Aplica as regras de pausa e diz se o bot pode falar |
| **Janela para o Vendedor Entrar** | Espera 8s antes de responder |
| **Reconferir Vendedor** | Depois da espera, confere se um humano entrou nesse intervalo |
| **Agente FAQ** | GPT-4o Mini com a FAQ no system prompt + memória das últimas 8 mensagens |
| **Classificar Lead** | Segunda chamada barata em JSON mode → temperatura, interesse, preço, precisa_humano |
| **Supabase** | *(desabilitado)* Uma chamada RPC cria/atualiza o lead e grava as mensagens |
| **Enviar no WhatsApp** | *(desabilitado)* Devolve a resposta pela Evolution API |
| **Marcar Envio do Bot** | *(desabilitado)* Guarda o id da mensagem enviada, para reconhecer o eco |

As duas regras que protegem o produto estão no system prompt do Agente FAQ:

- **Nunca inventar** preço, prazo, horário ou promoção — só usa o que está na Config
- Se não souber, responde sempre a mesma frase (*"Vou chamar alguém da equipe…"*) e marca
  `precisa_humano = true`, que é o que faz o lead pular no dashboard

---

## Passo 1 — Testar agora (só precisa da chave OpenAI)

1. Crie uma conta em [platform.openai.com](https://platform.openai.com), vá em
   **API keys → Create new secret key** e copie a chave (`sk-...`).
   Coloque uns **US$ 5** de crédito em *Billing* — vai durar meses.

2. No n8n: **Credentials → Add credential → OpenAI API** e cole a chave.

3. **Workflows → Import from File** e escolha `orvion-agente-faq.json`.

4. Abra o node **GPT-4o Mini** e selecione a credencial. Faça o mesmo no node
   **Classificar Lead** (usa a mesma credencial OpenAI).

5. Clique em **Open Chat** e teste nesta ordem:

   ```
   qual horário vocês abrem?
   entrega no Ipiranga?
   quanto custa a portuguesa grande?
   tem opção sem glúten?
   quero pedir uma calabresa com borda
   ```

   As duas últimas são as que importam: *sem glúten* **não** está na FAQ (tem que cair no
   "vou chamar a equipe") e *quero pedir* tem que virar lead **quente**.

6. **Agora teste o handoff.** No chat, digite:

   ```
   /vendedor pode deixar, eu assumo daqui
   ```

   Esse prefixo simula o vendedor assumindo a conversa (só funciona no Chat Trigger, é um
   atalho de teste). Depois disso, mande qualquer pergunta normal:

   ```
   e o refrigerante, quanto custa?
   ```

   O bot **não vai responder**. Abra o node **Bot em Silêncio** na execução e veja o campo
   `motivo_guardiao`: *"vendedor está atendendo, bot calado por mais 30 min"*.

Para ver a classificação de um lead, abra o node **Processar Classificação**.

---

## Passo 2 — Ligar o Supabase (dashboard)

1. No SQL Editor do Supabase, rode nesta ordem:
   [`../supabase/schema.sql`](../supabase/schema.sql) e depois
   [`../supabase/faq-agent.sql`](../supabase/faq-agent.sql).

2. Em **Settings → API**, copie a **Project URL** e a chave **`service_role`**.

3. No n8n: **Credentials → Add credential → Header Auth**
   - Name: `apikey`
   - Value: a chave `service_role`

4. No node **Config do Cliente**, troque `supabase_url` pela sua Project URL.

5. **Habilite** os dois nodes de Supabase (botão direito → *Enable*) e selecione a credencial
   em cada um: `Supabase: Registrar Interação` e `Supabase: Registrar Sem Resposta`.

> A `service_role` ignora RLS — é o esperado, porque o n8n roda no servidor.
> No frontend do dashboard vai a chave `anon`, nunca essa.

Detalhe importante: a temperatura do lead **só sobe** (frio → morno → quente), nunca desce.
Quem já demonstrou intenção de compra não volta a ser frio. E quando o vendedor assume no
WhatsApp, o lead vira `pegado_por_vendedor` no dashboard automaticamente.

---

## Passo 3 — Ligar o WhatsApp (Evolution API)

1. Suba a Evolution API e conecte o número do cliente (QR Code).

2. No n8n, **habilite** os nodes `Webhook Evolution API (produção)`,
   `Enviar no WhatsApp (Evolution)` e `Marcar Envio do Bot`.

3. Crie outra credencial **Header Auth** (`apikey` = a API key da sua Evolution) e selecione
   no node de envio.

4. No node **Config do Cliente**, preencha `evolution_url` e `evolution_instance`.

5. Copie a **Production URL** do node Webhook e cadastre na Evolution no evento
   **`messages.upsert`**.

   ⚠️ **Confirme que a Evolution está entregando também as mensagens `fromMe`.** É isso que
   permite detectar o vendedor digitando no celular. Se ela só mandar as mensagens recebidas,
   o mecanismo 1 e 2 não funcionam e o bot vai atropelar o vendedor.

6. **Ative o workflow** (toggle no canto superior direito). Sem isso a Production URL não
   responde.

7. Teste no WhatsApp real: mande uma pergunta de outro celular, deixe o bot responder, então
   responda você mesmo pelo celular da empresa e mande outra pergunta do celular do cliente.
   O bot tem que ficar calado.

---

## Como cadastrar um cliente novo

1. Duplique o workflow (`... → Duplicate`) e renomeie: `ORVION - FAQ - Nome do Cliente`.
2. Edite **só o node Config do Cliente**: `slug`, `nome_negocio`, `horario`, `endereco`,
   `entrega`, `pagamento`, `faq`, `evolution_instance`.
3. Rode no Supabase:
   ```sql
   insert into businesses (nome, slug, segmento, horario, localizacao)
   values ('Nome do Cliente', 'slug-do-cliente', 'Segmento', 'Horário', 'Endereço');
   ```
4. Crie a instância do número na Evolution e aponte o webhook.

Leva ~15 minutos por cliente. O trabalho real é **entrevistar o dono** para montar a FAQ —
é isso que faz o bot ser bom ou ruim.

### Como montar a FAQ (a parte que importa)

Peça para o dono abrir o WhatsApp e olhar as últimas 50 conversas. Anote as perguntas que
aparecem toda semana. Na prática são sempre estas:

- Horário de funcionamento (e feriado/domingo)
- Preço dos 5–10 itens mais vendidos
- Entrega: quais bairros, taxa, tempo
- Formas de pagamento
- Endereço / estacionamento
- As 3 perguntas específicas do ramo (sem glúten, aceita convênio, tem reserva…)

**Escreva também o que o negócio NÃO tem** (*"não temos massa sem glúten"*). Isso evita que
o modelo tente ser gentil e invente uma resposta — é o erro mais caro num bot pago.

---

## Custo real de API

Com gpt-4o-mini (US$ 0,15 por 1M tokens de entrada / US$ 0,60 de saída):

| | tokens | custo |
|---|---|---|
| Chamada do agente | ~1.000 entrada + 60 saída | US$ 0,00019 |
| Chamada do classificador | ~350 entrada + 50 saída | US$ 0,00008 |
| **Por mensagem** | | **~US$ 0,0003** |
| **Por conversa** (4 msgs) | | **~US$ 0,001 (≈ R$ 0,006)** |

Um cliente com **500 conversas/mês** custa **US$ 0,50 ≈ R$ 2,70** de API. A OpenAI é
irrelevante no seu custo — o que pesa é infraestrutura.

### Hospedagem: n8n não roda em Cloudflare Workers

Workers é serverless e o n8n precisa de um servidor Node ligado continuamente (com banco e
fila). As opções reais:

| Opção | Custo | Observação |
|---|---|---|
| **VPS Hetzner/Contabo + Docker** | ~R$ 30/mês | Roda n8n + Evolution no mesmo servidor. Recomendado |
| Railway / Render | ~R$ 30–110/mês | Deploy mais fácil, você não administra servidor |
| n8n Cloud | ~R$ 140/mês | Zero manutenção, mas a Evolution ainda precisa de VPS |

Você vai precisar de uma VPS de qualquer forma por causa da Evolution API — então vale rodar
as duas coisas nela.

### Supabase: o que eu sei e o que você precisa confirmar

Você notou certo que o plano Free é **por organização**, não por conta — dá para criar mais
de uma organização e ter projetos gratuitos em cada. Eu confirmei antes que isso zera seu
custo de banco, e fui longe demais. Antes de apostar seu modelo de preço nisso, confirme na
página de pricing do Supabase, porque:

- **Projeto Free pausa após ~7 dias sem atividade.** Com o bot escrevendo todo dia isso não
  deve acontecer, mas se um cliente ficar uma semana quieto o banco dele pausa e o dashboard
  cai. Reativar é manual.
- **Free não tem backup automático.** Perder a conversa de um cliente pagante é um problema
  contratual, não só técnico.
- O limite de organizações gratuitas por conta é uma política que a Supabase já mudou mais de
  uma vez. Não é boa base para uma operação de 85 clientes.

Sugestão prática: use Free para os primeiros clientes enquanto valida (o risco é aceitável
quando você tem 3 clientes e conhece todos), e migre para um projeto Pro compartilhado com
**RLS por `business_id`** quando passar de uns 5. O `business_id` já está no schema, e o
workflow suporta os dois jeitos — `supabase_url` está no node de Config, então cada cópia
aponta para o projeto que você quiser.

---

## Limitações honestas desta versão

- **O estado do guardião fica no banco do n8n** (`staticData`), não no Supabase. Funciona e
  sobrevive a restart, mas: se você rodar n8n em mais de um processo/worker, dois execuções
  simultâneas podem se atropelar. Antes de escalar, mova esse estado para o Supabase (a coluna
  `atendimento_humano_ate` já existe na tabela `leads` para isso).
- **A memória da conversa é em RAM.** Se o n8n reiniciar, o bot perde o contexto das conversas
  em andamento. Para produção, troque o node *Memória da Conversa* por Postgres Chat Memory
  apontando para o Supabase.
- **Sem debounce de mensagens do cliente.** Cliente que manda 3 mensagens seguidas gera 3
  respostas. A janela de 8s ajuda, mas não agrupa. Resolve com um Redis/Supabase de fila por
  telefone.
- **A janela de 8s não cobre 100% dos casos.** Se o vendedor demorar 10 segundos para mandar,
  o bot já falou. Diminuir a janela deixa o bot mais rápido e mais atropelador; aumentar deixa
  o cliente esperando. 8s é um meio razoável — ajuste por cliente.
- **O dashboard ainda não filtra por `business_id`.** Enquanto for um cliente só, funciona.
  Antes do segundo cliente isso precisa entrar.
- **Nada de LGPD ainda.** Você vai armazenar telefone e conversa de clientes de terceiros.
  Antes de vender, defina no contrato quem é controlador e quem é operador dos dados.
