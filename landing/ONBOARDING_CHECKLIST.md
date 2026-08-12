# Checklist de Onboarding — ORVION

Quando o cliente diz "SIM", siga esse checklist. Leva ~1 hora total.

---

## ANTES DA CALL (15 min)

- [ ] Cliente confirmou data/hora da call
- [ ] Você preparou 5 perguntas sobre a FAQ dele (veja abaixo)
- [ ] Testou seu n8n e Supabase (se não rodou em dias)
- [ ] Supabase está aberto na aba
- [ ] n8n está aberto na aba
- [ ] Seu WhatsApp pessoal está pronto pra testar a demo

---

## DURANTE A CALL (30 min)

### 1️⃣ Aquecimento (3 min)
```
"Oi [Nome]! Tudo certo aí? Ótimo, então vamos ver como funciona esse bot.

Primeiro, eu preciso entender melhor o negócio de vocês pra programar a FAQ certa.
Deixa eu fazer umas perguntas rápidas, ok?"
```

### 2️⃣ Entrevista de FAQ (20 min)

**Abra um Google Docs** e vá anotando as respostas dele nessas 5 perguntas:

**A. Horário de Funcionamento**
```
"Qual é o horário que vocês abrem e fecham?
Funciona todos os dias ou tem algum dia que fecha?
Faz atendimento de noite/madrugada?"
```

**B. Produtos/Serviços e Preços**
```
"Quais são os 5-10 principais produtos/serviços de vocês?
Qual é o preço de cada um? (ou o range, tipo 'de R$ 80 a R$ 150')"

[Anota como está na FAQ do bot: de forma legível]
```

**C. Entrega/Localização**
```
"Vocês entregam? Se sim:
- Quais bairros vocês entregam?
- Qual é a taxa?
- Quanto tempo leva?
- Tem entrega grátis acima de um valor?"

Se não entregam:
"Vocês tão em qual endereço? Perto de qual referência?"
```

**D. Formas de Pagamento**
```
"Vocês aceitam o quê? Dinheiro, Pix, débito, crédito, vale-refeição?"
```

**E. Restrições/O que NÃO têm**
```
"Tem algo que vocês NÃO fazem que cliente sempre pergunta?
Tipo: 'não temos sem glúten', 'não parcelo', 'não entregamos no domingo'?
Isso é SUPER importante — o bot precisa saber recusar de forma educada."
```

### 3️⃣ Demo ao Vivo (7 min)

**Mostre a ele:**

1. **Abra o dashboard ORVION** (mesmo que vazio)
```
"Aqui é o dashboard de vocês. A gente vai ver cada cliente que manda mensagem,
o que ele perguntou, o que o bot respondeu, se é lead quente/morno/frio."
```

2. **Faça um teste ao vivo no WhatsApp**
```
"Agora deixa eu simular um cliente mandando uma pergunta. Você manda uma 
mensagem pra mim, do tipo 'qual é o horário?' e vê o bot responder."

[Vocês trocam mensagem]

"Viu? Respondeu em 2 segundos. 24 horas por dia. E você?
Enquanto isso tá cuidando de coisas que rendem."
```

3. **Mostrar o passe de mão**
```
"E aqui o legal: se você quiser responder algo melhor, vocês digitam no WhatsApp
normalmente e o bot sai do caminho. Tipo, o bot respondeu 'Horário é das 9h às 18h',
mas você quer responder 'Das 9h às 18h, mas segunda de manhã a gente abre só a partir 
das 10h'. Vocês digitam, e pronto — continua a conversa com vocês."
```

---

## DEPOIS DA CALL (30 min)

### 4️⃣ Setup Técnico

**4.1 Criar Organização no Supabase**
- [ ] Acesse supabase.com/dashboard
- [ ] Clique "New organization"
- [ ] Nome: "ORVION - [Nome do Cliente]"
- [ ] Crie o projeto Free (será o banco dele)
- [ ] Copie a Project URL

**4.2 Rodar o SQL no Supabase**
- [ ] SQL Editor
- [ ] Cole o arquivo `supabase/schema.sql` inteiro
- [ ] Execute
- [ ] Cole o arquivo `supabase/faq-agent.sql` inteiro
- [ ] Execute

**4.3 Criar a Config do Cliente no n8n**
- [ ] Abra seu workflow "ORVION - Agente FAQ - Pizzaria" (ou o template base)
- [ ] Clique em "Duplicate workflow"
- [ ] Renomeie: "ORVION - Agente FAQ - [Nome do Cliente]"
- [ ] Abra o node "Config do Cliente"
- [ ] Edite estes campos com as informações que você coletou:
  - [ ] `slug`: "nome-do-negocio" (sem espaço, sem tilde)
  - [ ] `nome_negocio`: "Nome Completo"
  - [ ] `horario`: Colar exatamente como cliente falou
  - [ ] `endereco`: Colar
  - [ ] `entrega`: Colar (ou deixar em branco se não entrega)
  - [ ] `pagamento`: Colar
  - [ ] `faq`: **IMPORTANTE** — botar aqui TUDO que você coletou, bem formatado
  - [ ] `supabase_url`: A URL que você copiou acima
  - [ ] `evolution_instance`: Deixa como tá por enquanto (vai mudar depois)

**4.4 Testar no Chat do n8n**
- [ ] Open Chat (embaixo do workflow)
- [ ] Mande uma pergunta:
  ```
  qual é o horário?
  ```
- [ ] O bot tem que responder com o horário que você colocou na config
- [ ] Teste 3 perguntas diferentes (uma que tá na FAQ, uma que tá meio, uma que não tá)

**4.5 Credenciais do Supabase**
- [ ] Supabase Settings → API
- [ ] Copie o `service_role` key (NUNCA a `anon`, essa é pra frontend)
- [ ] No n8n: Credentials → Header Auth
  - [ ] Name: `apikey`
  - [ ] Value: [colar a service_role key]
  - [ ] Save

**4.6 Habilitar o Supabase no Workflow**
- [ ] Node "Supabase: Registrar Interação" → right-click → Enable
- [ ] Selecione a credencial que você criou
- [ ] Node "Supabase: Registrar Sem Resposta" → right-click → Enable
- [ ] Selecione a mesma credencial
- [ ] Save

---

## COMUNICADO PRO CLIENTE (enviar depois do setup)

```
Oi [Nome]! 🎉

Já configurei seu bot! Tá pronto pra começar.

**Como funciona a partir de agora:**

1. **Chat de teste**: Por enquanto vamo usar um chat de teste pra vocês 
verem como funciona (tá aqui: [LINK DO CHAT])

2. **Próxima semana**: A gente conecta o bot de verdade no WhatsApp de vocês. 
Pra isso preciso que vocês:
   - Criem uma conta na Evolution API (vou mandar o link)
   - Façam a integração (é bem rápido)
   - Me avisam quando tiver pronto

3. **Depois**: Bot começa a funcionar 24h no número de vocês.

**Qualquer dúvida, me manda mensagem direto aqui.**

Boa sorte! 🚀
```

---

## APÓS 7 DIAS (Follow-up)

**Mande mensagem:**
```
Oi [Nome], beleza? 

Como tá indo com o bot? Já tá economizando tempo?
Manda um print do dashboard pra eu ver como tá 😊

Alguma dúvida ou sugestão, é só chamar!
```

**Se cliente tiver problema:**
- [ ] Identifique o problema rápido
- [ ] Resolva na hora (mexe na config do bot se preciso)
- [ ] Confirme que tá funcionando
- [ ] Mande mensagem: "Pronto, resolvido! Deixa de olho se der mais problema"

**Se cliente estiver feliz:**
- [ ] Mande: "Ótimo! Quer me indicar pra alguém que você conhece? 
Mando uma demo em 15 min"

---

## Arquivo de Referência (Guardar pra sempre)

Para cada cliente, crie uma pasta com:
```
cliente-[nome]/
  ├── config-original.txt          (respostas da entrevista)
  ├── supabase-url.txt             (project URL)
  ├── n8n-workflow-id.txt          (ID do workflow duplicado)
  ├── evolution-api-status.txt     (conectado? não?)
  └── notas.md                     (problemas, ajustes, feedback)
```

---

## Tempo Estimado

- **Qualificação**: 5 min
- **Call com cliente**: 30 min
- **Setup técnico**: 20 min
- **Teste**: 5 min
- **Total**: 1h

**Depois disso, cliente tá usando o bot.**
