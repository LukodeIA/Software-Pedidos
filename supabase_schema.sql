-- Create Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  category text,
  active boolean default true,
  image_url text
);

-- Create Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_phone text,
  address text,
  items jsonb, -- Storing array of items as JSON
  total numeric not null,
  status text not null default 'pending', -- pending, preparing, ready, delivered
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) is recommended, but for simplicity startup:
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Create policies (modify as needed for your auth requirements)
-- Allow read access to everyone for products
create policy "Public products are viewable by everyone" on public.products
  for select using (true);

-- Allow full access to authenticated users (or everyone for now during dev)
-- WARNING: For production, tighten these policies!
create policy "Enable all access for all users" on public.products
  for all using (true) with check (true);

create policy "Enable all access for all users" on public.orders
  for all using (true) with check (true);

-- -----------------------------------------------------------------------------
-- USERS & PROFILES (RBAC)
-- -----------------------------------------------------------------------------

-- Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  role text check (role in ('admin', 'employee')) default 'employee',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'employee');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function
-- This trigger will run every time a user is created in Auth > Users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();