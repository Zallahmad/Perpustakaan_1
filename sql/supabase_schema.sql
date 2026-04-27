-- Extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- ENUMS
create type user_role as enum ('admin', 'petugas', 'member');
create type loan_status as enum ('dipinjam', 'dikembalikan', 'terlambat', 'hilang');

-- PROFILES (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- MEMBERS
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  member_no text unique not null,
  full_name text not null,
  email text unique not null,
  phone text,
  class_name text,
  photo_url text,
  qr_payload text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.generate_member_no()
returns text
language plpgsql
as $$
declare
  next_number integer;
begin
  select count(*) + 1 into next_number from public.members;
  return 'MBR-' || to_char(now(), 'YYYY') || '-' || lpad(next_number::text, 4, '0');
end;
$$;

create or replace function public.set_member_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.member_no is null or new.member_no = '' then
    new.member_no := public.generate_member_no();
  end if;
  if new.qr_payload is null or new.qr_payload = '' then
    new.qr_payload := new.member_no || '|' || new.id::text;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_member_defaults
before insert or update on public.members
for each row execute function public.set_member_defaults();

-- MASTER BOOKS
create table if not exists public.book_categories (
  id uuid primary key default gen_random_uuid(),
  category_name text not null unique
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  isbn text,
  title text not null,
  author text,
  publisher text,
  publish_year integer,
  category_id uuid references public.book_categories(id) on delete set null,
  stock_total integer not null default 0,
  stock_available integer not null default 0,
  shelf_location text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_stock_non_negative check (stock_total >= 0 and stock_available >= 0),
  constraint chk_stock_available check (stock_available <= stock_total)
);

-- EBOOK SOURCES + CATALOG
create table if not exists public.ebook_sources (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  base_url text not null,
  license_type text,
  active boolean not null default true,
  last_scraped_at timestamptz
);

create table if not exists public.ebooks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.ebook_sources(id) on delete set null,
  title text not null,
  author text,
  language text,
  published_year integer,
  subjects text[],
  license_type text,
  file_url text not null,
  cover_url text,
  created_at timestamptz default now()
);

-- LOANS
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id),
  book_id uuid not null references public.books(id),
  loan_date date not null default current_date,
  due_date date not null,
  return_date date,
  status loan_status not null default 'dipinjam',
  fine_amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_due_date check (due_date >= loan_date)
);

create table if not exists public.fine_rules (
  id uuid primary key default gen_random_uuid(),
  fine_per_day numeric(12,2) not null default 2000,
  active boolean not null default true
);

insert into public.fine_rules (fine_per_day, active)
select 2000, true
where not exists (select 1 from public.fine_rules where active = true);

create or replace function public.process_return(p_loan_id uuid, p_return_date date default current_date)
returns public.loans
language plpgsql
as $$
declare
  v_loan public.loans;
  v_fine_per_day numeric(12,2);
  v_late_days integer;
begin
  select * into v_loan from public.loans where id = p_loan_id for update;
  if not found then
    raise exception 'Loan not found';
  end if;

  if v_loan.status <> 'dipinjam' then
    return v_loan;
  end if;

  select fine_per_day into v_fine_per_day
  from public.fine_rules
  where active = true
  order by id desc
  limit 1;

  v_late_days := greatest((p_return_date - v_loan.due_date), 0);

  update public.loans
  set
    return_date = p_return_date,
    status = case when v_late_days > 0 then 'terlambat' else 'dikembalikan' end,
    fine_amount = v_late_days * coalesce(v_fine_per_day, 0),
    updated_at = now()
  where id = p_loan_id
  returning * into v_loan;

  update public.books
  set stock_available = stock_available + 1,
      updated_at = now()
  where id = v_loan.book_id;

  return v_loan;
end;
$$;

create or replace function public.create_loan(p_member_id uuid, p_book_id uuid, p_due_date date)
returns public.loans
language plpgsql
as $$
declare
  v_book public.books;
  v_loan public.loans;
begin
  select * into v_book from public.books where id = p_book_id for update;
  if not found then
    raise exception 'Book not found';
  end if;

  if v_book.stock_available <= 0 then
    raise exception 'Book stock unavailable';
  end if;

  insert into public.loans(member_id, book_id, loan_date, due_date, status)
  values (p_member_id, p_book_id, current_date, p_due_date, 'dipinjam')
  returning * into v_loan;

  update public.books
  set stock_available = stock_available - 1,
      updated_at = now()
  where id = p_book_id;

  return v_loan;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.books enable row level security;
alter table public.book_categories enable row level security;
alter table public.loans enable row level security;
alter table public.ebooks enable row level security;
alter table public.ebook_sources enable row level security;

create or replace function public.current_user_role()
returns user_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "admin_petugas_all_members" on public.members
for all
using (public.current_user_role() in ('admin','petugas'))
with check (public.current_user_role() in ('admin','petugas'));

create policy "member_read_self" on public.members
for select
using (user_id = auth.uid());

create policy "admin_petugas_books_all" on public.books
for all
using (public.current_user_role() in ('admin','petugas'))
with check (public.current_user_role() in ('admin','petugas'));

create policy "all_read_books" on public.books
for select
using (true);

create policy "admin_petugas_loans_all" on public.loans
for all
using (public.current_user_role() in ('admin','petugas'))
with check (public.current_user_role() in ('admin','petugas'));

create policy "member_read_own_loans" on public.loans
for select
using (member_id in (select id from public.members where user_id = auth.uid()));

-- MONTHLY REPORT QUERIES
-- Summary
-- select * from rpc / SQL editor
--
-- with monthly_loans as (
--   select l.*, m.member_no, m.full_name, b.title as book_title
--   from loans l
--   join members m on m.id = l.member_id
--   join books b on b.id = l.book_id
--   where date_trunc('month', l.loan_date) = date_trunc('month', now())
-- )
-- select
--   count(*) filter (where status = 'dipinjam') as total_dipinjam,
--   count(*) filter (where status = 'dikembalikan') as total_kembali,
--   count(*) filter (where status = 'terlambat') as total_terlambat,
--   coalesce(sum(fine_amount), 0) as total_denda
-- from monthly_loans;
