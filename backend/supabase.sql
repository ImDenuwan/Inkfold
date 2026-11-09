-- Run this once in Supabase: SQL Editor > New query > Run
create table if not exists papers (
  guest_id   text not null,
  doc_id     text not null,
  filename   text,
  summary    jsonb,
  messages   jsonb default '[]',
  updated_at timestamptz default now(),
  primary key (guest_id, doc_id)
);

-- Only the backend (with the secret key) can read or write
alter table papers enable row level security;
