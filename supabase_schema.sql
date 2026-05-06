-- ============================================================
-- Casa de Novias Milagros — Supabase Schema
-- Run this in Supabase SQL Editor (supabase.com)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users ──────────────────────────────────────────────────
create table if not exists usuarios (
  id        bigint primary key generated always as identity,
  name      text not null,
  username  text not null unique,
  password  text not null,
  role      text not null check (role in ('owner','admin','seller')),
  active    boolean default true,
  created_at timestamptz default now()
);

-- ── Categories ─────────────────────────────────────────────
create table if not exists categorias (
  id    bigint primary key generated always as identity,
  name  text not null unique
);

-- ── Items ──────────────────────────────────────────────────
create table if not exists items (
  id               bigint primary key generated always as identity,
  nombre           text not null,
  codigo           text not null unique,
  categoria        text not null,
  calidad          text not null,
  talla            text,
  color            text,
  estado           text default 'Disponible',
  tipo             text default 'Ambos',
  precio_venta     numeric default 0,
  precio_alquiler  numeric default 0,
  notas            text default '',
  imagen           text,
  created_at       timestamptz default now()
);

-- ── Alquileres ─────────────────────────────────────────────
create table if not exists alquileres (
  id                   bigint primary key generated always as identity,
  item_id              bigint references items(id),
  seller_id            bigint references usuarios(id),
  seller_name          text,
  cliente              text not null,
  dni                  text,
  telefono             text,
  fecha_inicio         date not null,
  fecha_devolucion     date not null,
  fecha_devolucion_real date,
  precio_base          numeric default 0,
  descuento            numeric default 0,
  monto_total          numeric default 0,
  deposito             numeric default 0,
  estado               text default 'Activo',
  notas                text default '',
  cancelado            boolean default false,
  cancelado_por        text,
  fecha_cancelacion    date,
  created_at           timestamptz default now()
);

-- ── Historial ──────────────────────────────────────────────
create table if not exists historial (
  id           bigint primary key generated always as identity,
  tipo         text not null,
  seller_id    bigint references usuarios(id),
  seller_name  text,
  item_id      bigint,
  item_nombre  text,
  item_codigo  text,
  cliente      text,
  fecha        date not null,
  precio_base  numeric default 0,
  descuento    numeric default 0,
  monto        numeric default 0,
  notas        text default '',
  cancelado    boolean default false,
  cancelado_por text,
  created_at   timestamptz default now()
);

-- ── Caja ───────────────────────────────────────────────────
create table if not exists caja (
  id           bigint primary key generated always as identity,
  tipo         text not null check (tipo in ('Ingreso','Gasto')),
  categoria    text,
  descripcion  text,
  monto        numeric default 0,
  fecha        date not null,
  user_id      bigint references usuarios(id),
  user_name    text,
  ref_id       bigint,
  created_at   timestamptz default now()
);

-- ── Disable RLS (simple app, single tenant) ────────────────
alter table usuarios   disable row level security;
alter table categorias disable row level security;
alter table items      disable row level security;
alter table alquileres disable row level security;
alter table historial  disable row level security;
alter table caja       disable row level security;

-- ── Seed initial data ──────────────────────────────────────
insert into usuarios (name, username, password, role) values
  ('Victoria Ramos Cano',  'Victoria1904', 'pequeñita951',   'owner'),
  ('Rosario Ramos Cano',   'Rosario1547',  'tengosueño7542', 'admin'),
  ('Jeampier Muñoz Silva', 'Jeampier',     'Jeampier626',    'admin')
on conflict (username) do nothing;

insert into categorias (name) values
  ('Vestido de Novia'),('Vestido de Quinceaños'),('Vestido de Gala'),
  ('Terno'),('Disfraz'),('Traje Típico'),('Dama de Honor'),('Accesorio'),('Otro')
on conflict (name) do nothing;
