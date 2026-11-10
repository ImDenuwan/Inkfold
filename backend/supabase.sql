-- Run this once in Supabase: SQL Editor > New query > Run
-- (it replaces the older version of the table)
drop table if exists papers;

create table papers (
  owner_id   text not null,               -- the user's id when signed in, else the browser's guest id
  doc_id     text not null,
  signed_in  boolean not null default false,
  filename   text,
  summary    jsonb,
  messages   jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (owner_id, doc_id)
);

-- Only the backend (with the secret key) can read or write
alter table papers enable row level security;
