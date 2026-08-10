-- ORVION Dashboard - schema Supabase
create extension if not exists "uuid-ossp";

create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  segmento text,
  faq text,
  horario text,
  localizacao text,
  created_at timestamp default now()
);

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id),
  nome text not null,
  telefone text,
  interesse text,
  preco text,
  temperatura text check (temperatura in ('quente', 'morno', 'frio')),
  status text check (status in ('aberto', 'pegado_por_voce', 'convertido', 'perdido')) default 'aberto',
  data_criacao timestamp default now(),
  atualizado_em timestamp default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete cascade,
  sender text check (sender in ('cliente', 'bot', 'vendedor')),
  conteudo text not null,
  timestamp timestamp default now()
);

-- habilita realtime nas tabelas usadas pelo dashboard
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table messages;

-- dados de exemplo
insert into businesses (nome, segmento, faq, horario, localizacao)
values ('Espaço Bella Estética', 'Beleza & Estética', 'Botox, preenchimento, limpeza de pele, drenagem linfática, peeling.', 'Seg-Sex 9h-19h, Sáb 9h-14h', 'Av. Paulista, 1200 - São Paulo/SP');

with biz as (select id from businesses limit 1)
insert into leads (business_id, nome, telefone, interesse, preco, temperatura, status)
select biz.id, v.nome, v.telefone, v.interesse, v.preco, v.temperatura, 'aberto'
from biz, (values
  ('João Silva', '11999999999', 'Corte', 'R$ 80', 'quente'),
  ('Maria Santos', '11888888888', 'Coloração', 'R$ 150', 'quente'),
  ('Pedro Costa', '11777777777', 'Perguntou preço', null, 'morno')
) as v(nome, telefone, interesse, preco, temperatura);

insert into messages (lead_id, sender, conteudo)
select id, 'cliente', 'Quanto custa um corte?' from leads where nome = 'João Silva'
union all
select id, 'bot', 'Corte custa R$ 80. Quer marcar?' from leads where nome = 'João Silva'
union all
select id, 'cliente', 'Sim!' from leads where nome = 'João Silva'
union all
select id, 'bot', 'Ótimo! Vou conectar você com nosso atendente' from leads where nome = 'João Silva';
