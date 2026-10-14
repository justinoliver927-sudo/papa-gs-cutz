-- PaPa Gs Cutz starter schema. Run in Supabase SQL Editor on a NEW project or review carefully first.
-- Security model: customers can submit a request and read only their own signed-in requests;
-- only profiles.is_business_admin=true can view/manage all requests. Public/anonymous inserts are
-- intentionally allowed for the no-account booking flow; protect against spam before heavy promotion.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  is_business_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  customer_phone text not null check (char_length(customer_phone) between 3 and 30),
  service_name text not null check (char_length(service_name) between 1 and 120),
  service_price numeric(10,2) not null default 0 check (service_price >= 0),
  booking_date date not null,
  booking_time text not null check (char_length(booking_time) between 1 and 20),
  notes text check (notes is null or char_length(notes) <= 1000),
  terms_accepted boolean not null default false check (terms_accepted = true),
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_requests_user_id_created_at_idx on public.booking_requests(user_id, created_at desc);
create index if not exists booking_requests_date_status_idx on public.booking_requests(booking_date, status);

create or replace function public.is_business_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_business_admin = true
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_papa_profile on auth.users;
create trigger on_auth_user_created_papa_profile
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.booking_requests enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.booking_requests from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select, insert on public.booking_requests to anon;
grant select, insert, update on public.booking_requests to authenticated;

-- A customer can view/update their own profile, but cannot change their admin flag.
drop policy if exists "profile owner can read own profile" on public.profiles;
create policy "profile owner can read own profile" on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select public.is_business_admin()));
drop policy if exists "profile owner can update own name" on public.profiles;
create policy "profile owner can update own name" on public.profiles for update to authenticated
using ((select auth.uid()) = id or (select public.is_business_admin()))
with check ((select auth.uid()) = id or (select public.is_business_admin()));
-- Column-level UPDATE grant above limits ordinary users to full_name; is_business_admin cannot be self-assigned.

-- The front-end is allowed to submit booking requests without an account. Anonymous visitors cannot read them.
drop policy if exists "public can submit booking request" on public.booking_requests;
create policy "public can submit booking request" on public.booking_requests for insert to anon, authenticated
with check (
  terms_accepted = true
  and (user_id is null or user_id = (select auth.uid()))
  and status = 'pending'
);
drop policy if exists "customers read own booking requests" on public.booking_requests;
create policy "customers read own booking requests" on public.booking_requests for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_business_admin()));
drop policy if exists "business admin updates booking requests" on public.booking_requests;
create policy "business admin updates booking requests" on public.booking_requests for update to authenticated
using ((select public.is_business_admin()))
with check ((select public.is_business_admin()));

-- IMPORTANT: after the owner signs up, use the Supabase SQL Editor to grant admin status to the exact owner account:
-- update public.profiles set is_business_admin = true where id = (select id from auth.users where email = 'OWNER_EMAIL_HERE');
-- Then set the same owner email in js/config.js. Do not give admin access to customers.
