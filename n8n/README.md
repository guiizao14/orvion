# ORVION — Agente FAQ (n8n + GPT-4o Mini)

Bot que responde as perguntas repetitivas do WhatsApp de um negócio local, classifica o lead
(quente/morno/frio) e joga tudo no dashboard ORVION. Produto pensado para vender como
assinatura mensal.

Arquivo para importar: [`orvion-agente-faq.json`](orvion-agente-faq.json)

---

## Como o workflow funciona

```
Chat Trigger (teste)  ─┐
                       ├─→ Normalizar Entrada ─→ Config do Cliente ─→ Agente FAQ ─→ Classificar Lead
Webhook Evolution ─────┘                                              (gpt-4o-mini)   (gpt-4o-mini
   (desabilitado)                                                      + memória)       JSON mode)
                                                                                            │
                          Enviar no WhatsApp ←─ Resposta ←─ Supabase ←─ Processar Classificação
                            (desabilitado)                (desabilitado)
```

| Node | O que faz |
|---|---|
| **Chat Trigger (teste)** | Abre um chat dentro do n8n para você testar digitando |
| **Webhook Evolution API** | *(desabilitado)* Recebe as mensagens reais do WhatsApp depois |
| **Normalizar Entrada** | Aceita os dois formatos e padroniza em `mensagem / telefone / nome / sessionId`. Ignora grupos e mensagens do próprio número |
| **Config do Cliente** | **O único node que você edita por cliente**: nome, horário, endereço, entrega, pagamento e FAQ |
| **Agente FAQ** | GPT-4o Mini com a FAQ no system prompt + memória das últimas 8 mensagens |
| **Classificar Lead** | Segunda chamada barata em JSON mode → temperatura, interesse, preço, precisa_humano |
| **Processar Classificação** | Faz o parse. Se a classificação falhar, cai num padrão em vez de derrubar o atendimento |
| **Supabase** | *(desabilitado)* Uma chamada RPC que cria/atualiza o lead e grava as 2 mensagens |
| **Enviar no WhatsApp** | *(desabilitado)* Devolve a resposta pela Evolution API |

As duas regras que protegem o produto estão no system prompt do Agente FAQ:

- **Nunca inventar** preço, prazo, horário ou promoção — só usa o que está na Config
- Se não souber, responde sempre a mesma frase (*"Vou chamar alguém da equipe…"*) e marca
  `precisa_humano = true`, que é o que faz o lead aparecer no dashboard para o vendedor

---

## Passo 1 — Testar agora (só precisa da chave OpenAI)

1. Crie uma conta em [platform.openai.com](https://platform.openai.com), vá em
   **API keys → Create new secret key** e copie a chave (`sk-...`).
   Coloque uns **US$ 5** de crédito em *Billing* — vai durar meses.

2. No n8n: **Credentials → Add credential → OpenAI API** e cole a chave.

3. **Workflows → Import from File** e escolha `orvion-agente-faq.json`.

4. Abra o node **GPT-4o Mini** e selecione a credencial. Faça o mesmo no node
   **Classificar Lead** (ele usa a mesma credencial OpenAI).

5. Clique em **Open Chat** (embaixo) e teste:

   ```
   qual horário vocês abrem?
   entrega no Ipiranga?
   quanto custa a portuguesa grande?
   tem opção sem glúten?
   quero pedir uma calabresa com borda
   ```

As duas últimas são as importantes: *sem glúten* não está na FAQ (tem que cair no
"vou chamar a equipe"), e *quero pedir* tem que virar lead **quente**.

Para ver a classificação, clique no node **Processar Classificação** depois de rodar.

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

5. No node **Supabase: Registrar Interação**: selecione a credencial e **habilite o node**
   (clique com o botão direito → *Enable*).

> A `service_role` ignora RLS — é o esperado, porque o n8n roda no servidor.
> Nunca use essa chave no frontend do dashboard (lá vai a `anon`).

Cada mensagem agora cria/atualiza o lead. Detalhe: a temperatura **só sobe**
(frio → morno → quente), nunca desce — quem já demonstrou intenção de compra não volta a ser frio.

---

## Passo 3 — Ligar o WhatsApp (Evolution API)

1. Suba a Evolution API e conecte o número do cliente (QR Code).

2. No n8n, **habilite** os nodes `Webhook Evolution API (produção)` e
   `Enviar no WhatsApp (Evolution)`.

3. Crie outra credencial **Header Auth** (`apikey` = a API key da sua Evolution) e
   selecione no node de envio.

4. No node **Config do Cliente**, preencha `evolution_url` e `evolution_instance`.

5. Copie a **Production URL** do node Webhook e cadastre na Evolution como webhook do
   evento **`messages.upsert`**.

6. **Ative o workflow** (toggle no canto superior direito). Sem isso a Production URL não responde.

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

Peça para o cliente abrir o WhatsApp dele e olhar as últimas 50 conversas. Anote as
perguntas que aparecem toda semana. Na prática são sempre estas:

- Horário de funcionamento (e feriado/domingo)
- Preço dos 5–10 itens mais vendidos
- Entrega: quais bairros, taxa, tempo
- Formas de pagamento
- Endereço / estacionamento
- As 3 perguntas específicas do ramo (sem glúten, aceita convênio, tem reserva…)

**Escreva também o que o negócio NÃO tem** (*"não temos massa sem glúten"*). Isso evita que
o modelo tente ser gentil e invente uma resposta — é o erro mais caro num bot pago.

---

## Custo real (corrigindo o que eu te falei antes)

Eu te dei antes um número de US$ 30–50 por cliente/mês. **Isso estava errado**, e por muito.
A conta de verdade com gpt-4o-mini (US$ 0,15 por 1M tokens de entrada / US$ 0,60 de saída):

| | tokens | custo |
|---|---|---|
| Chamada do agente | ~1.000 entrada + 60 saída | US$ 0,00019 |
| Chamada do classificador | ~350 entrada + 50 saída | US$ 0,00008 |
| **Por mensagem** | | **~US$ 0,0003** |
| **Por conversa** (4 msgs) | | **~US$ 0,001 (≈ R$ 0,006)** |

Um cliente com **500 conversas/mês** custa **US$ 0,50 ≈ R$ 2,70** de API. A OpenAI é
praticamente irrelevante no seu custo. O que pesa é infraestrutura.

### Cenário com 10 clientes a R$ 350 = R$ 3.500/mês

| Item | Custo/mês |
|---|---|
| VPS (n8n + Evolution API juntos, Hetzner CX22) | ~R$ 30 |
| Supabase Pro (1 projeto compartilhado) | ~R$ 135 |
| OpenAI (todos os 10 clientes) | ~R$ 30 |
| **Total** | **~R$ 195** |
| **Margem** | **~R$ 3.300 (94%)** |

### Dois avisos importantes

**1. n8n não roda em Cloudflare Workers.** Você mencionou Cloudflare — Workers é serverless
e o n8n precisa de um servidor Node rodando de forma contínua (com banco e fila). As opções
reais para rodar 100% sozinho:

| Opção | Custo | Observação |
|---|---|---|
| **VPS Hetzner/Contabo + Docker** | ~R$ 30/mês | Mais barato, roda n8n + Evolution no mesmo servidor. Recomendado |
| Railway / Render | ~R$ 30–110/mês | Deploy mais fácil, você não administra servidor |
| n8n Cloud | ~R$ 140/mês | Zero manutenção, mas a Evolution API ainda precisa de VPS |

De qualquer forma você vai precisar de uma VPS por causa da Evolution API — então vale
rodar as duas coisas nela.

**2. Um projeto Supabase por cliente vai comer sua margem.** O free tier permite só
**2 projetos** por conta. Depois é **US$ 25 por projeto/mês** — com 10 clientes isso é
US$ 250 (~R$ 1.350/mês) só de banco, contra US$ 25 de um projeto compartilhado.

Você disse que quer separado para os dados não cruzarem, e a preocupação é certa — mas o
isolamento você consegue no mesmo projeto com **RLS por `business_id`**, que é exatamente
para isso. O `business_id` já está no schema. Se ainda assim preferir projetos separados,
o workflow suporta: `supabase_url` está no node Config, então cada cópia aponta para o
projeto que você quiser.

Sugestão prática: comece compartilhado com RLS. Se um cliente maior exigir banco dedicado
por contrato, aí você cobra por isso.

---

## Limitações honestas desta versão

- **A memória é do n8n (em RAM).** Se o n8n reiniciar, o bot perde o contexto das conversas
  em andamento. Para produção, troque o node *Memória da Conversa* por Postgres Chat Memory
  apontando para o Supabase.
- **Sem controle de "vendedor assumiu".** Hoje o bot responde sempre. O ideal é: se
  `status` do lead começar com `pegado_`, o bot fica calado para não atropelar o vendedor.
  É um node IF antes do Agente FAQ.
- **Sem debounce.** Cliente que manda 3 mensagens seguidas gera 3 respostas. Resolve com um
  Wait de ~5s + agrupamento por telefone.
- **O dashboard ainda não filtra por `business_id`.** Enquanto for um cliente só, funciona.
  Antes do segundo cliente isso precisa entrar.
- **Nada de LGPD ainda.** Você vai armazenar telefone e conversa de clientes de terceiros.
  Antes de vender, coloque no contrato quem é controlador e quem é operador dos dados.
