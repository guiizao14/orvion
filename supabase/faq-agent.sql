-- ORVION - Agente FAQ
-- Rode este script DEPOIS de supabase/schema.sql, no SQL Editor do Supabase.
-- Ele adiciona o que o workflow n8n precisa: slug do negócio, campos extras no lead
-- e uma função única que o n8n chama a cada mensagem.

-- 1) Identificador legível do negócio (é o que você coloca no node "Config do Cliente")
alter table businesses add column if not exists slug text;
create unique index if not exists businesses_slug_key on businesses (slug);

-- 2) Campos que o agente preenche
alter table leads add column if not exists preco text;
alter table leads add column if not exists precisa_humano boolean default false;
alter table leads add column if not exists total_mensagens int default 0;

-- Enquanto este horário não passar, o vendedor está no comando e o bot fica calado
alter table leads add column if not exists atendimento_humano_ate timestamptz;

-- O status passa a aceitar 'pegado_por_vendedor', usado quando o vendedor assume no WhatsApp
alter table leads drop constraint if exists leads_status_check;

-- Um lead por telefone dentro de cada negócio (é a chave do upsert)
create unique index if not exists leads_business_telefone_key
  on leads (business_id, telefone);

-- 3) A função que o n8n chama.
-- Faz tudo numa só chamada: cria ou atualiza o lead, e grava as duas mensagens.
create or replace function registrar_interacao(
  p_slug           text,
  p_telefone       text,
  p_nome           text,
  p_interesse      text,
  p_temperatura    text,
  p_preco          text,
  p_msg_cliente    text,
  p_msg_bot        text,
  p_precisa_humano boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_lead_id     uuid;
begin
  select id into v_business_id from businesses where slug = p_slug;

  if v_business_id is null then
    raise exception 'Negócio com slug "%" não encontrado na tabela businesses', p_slug;
  end if;

  -- cria o lead na primeira mensagem, ou atualiza nas seguintes
  insert into leads (
    business_id, nome, telefone, interesse, preco,
    temperatura, status, precisa_humano, total_mensagens
  )
  values (
    v_business_id, p_nome, p_telefone, p_interesse, p_preco,
    p_temperatura, 'aberto', p_precisa_humano, 2
  )
  on conflict (business_id, telefone) do update set
    interesse       = excluded.interesse,
    preco           = coalesce(excluded.preco, leads.preco),
    precisa_humano  = excluded.precisa_humano,
    total_mensagens = leads.total_mensagens + 2,
    atualizado_em   = now(),
    -- a temperatura só sobe (frio -> morno -> quente), nunca desce
    temperatura = case
      when excluded.temperatura = 'quente' then 'quente'
      when excluded.temperatura = 'morno' and leads.temperatura = 'frio' then 'morno'
      else leads.temperatura
    end
  returning id into v_lead_id;

  insert into messages (lead_id, sender, conteudo) values
    (v_lead_id, 'cliente', p_msg_cliente),
    (v_lead_id, 'bot',     p_msg_bot);

  return v_lead_id;
end;
$$;

-- 4) Função para gravar UMA mensagem sem resposta do bot.
-- Usada em dois casos: o vendedor assumiu a conversa no WhatsApp, ou o cliente
-- escreveu enquanto o vendedor estava atendendo (bot em silêncio).
create or replace function registrar_mensagem(
  p_slug          text,
  p_telefone      text,
  p_nome          text,
  p_sender        text,
  p_conteudo      text,
  p_assumiu       boolean default false,
  p_pausa_minutos int default 30
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_lead_id     uuid;
begin
  select id into v_business_id from businesses where slug = p_slug;

  if v_business_id is null then
    raise exception 'Negócio com slug "%" não encontrado na tabela businesses', p_slug;
  end if;

  insert into leads (
    business_id, nome, telefone, interesse, temperatura, status,
    total_mensagens, atendimento_humano_ate
  )
  values (
    v_business_id, p_nome, p_telefone, 'Atendimento humano', 'morno',
    case when p_assumiu then 'pegado_por_vendedor' else 'aberto' end,
    1,
    case when p_assumiu then now() + make_interval(mins => p_pausa_minutos) else null end
  )
  on conflict (business_id, telefone) do update set
    total_mensagens = leads.total_mensagens + 1,
    atualizado_em   = now(),
    status = case when p_assumiu then 'pegado_por_vendedor' else leads.status end,
    atendimento_humano_ate = case
      when p_assumiu then now() + make_interval(mins => p_pausa_minutos)
      else leads.atendimento_humano_ate
    end,
    -- quando o vendedor entra, o lead deixa de precisar de atenção
    precisa_humano = case when p_assumiu then false else leads.precisa_humano end
  returning id into v_lead_id;

  insert into messages (lead_id, sender, conteudo)
  values (v_lead_id, p_sender, p_conteudo);

  return v_lead_id;
end;
$$;

-- 5) Cadastre seu primeiro cliente (ajuste os dados)
insert into businesses (nome, slug, segmento, horario, localizacao)
values (
  'Pizzaria do Zé',
  'pizzaria-do-ze',
  'Alimentação',
  'Terça a domingo, 18h às 23h30',
  'Rua das Acácias, 245 - Vila Mariana, São Paulo/SP'
)
on conflict (slug) do nothing;
