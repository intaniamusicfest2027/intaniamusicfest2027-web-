-- =====================================================================
--  INTANIA MUSIC FEST 2027 — Supabase schema
--  Run this whole file once in Supabase → SQL Editor → New query → Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

-- Feature switches & numbers the admin can change from the back office
create table if not exists public.settings (
  key   text primary key,
  value jsonb not null
);

insert into public.settings (key, value) values
  ('eng_round_open',      'true'),    -- Dec: registration for Engineering students
  ('general_round_open',  'false'),   -- Jan: registration for everyone
  ('allow_external',      'true'),    -- general round: allow people outside Chula
  ('referral_open',       'true'),    -- friend-invite campaign earns points
  ('points_per_referral', '1'),       -- points the inviter gets per friend
  ('points_signup_bonus', '0'),       -- points the new person gets for using a code
  ('ticket_open',         'false'),   -- show QR ticket on "My ticket" page
  ('redeem_open',         'false'),   -- staff can redeem points on event day
  ('target',              '12000')    -- goal used by the admin pie chart
on conflict (key) do nothing;

create table if not exists public.groups (
  code          text primary key,
  sort          int  not null,
  member_count  int                        -- optional: group size for % ranking
);

insert into public.groups (code, sort) values
  ('A',1),('B',2),('C',3),('Dog',4),('E',5),('F',6),('G',7),('H',8),('J',9),
  ('K',10),('L',11),('M',12),('N',13),('P',14),('Q',15),('R',16),('S',17),('T',18)
on conflict (code) do nothing;

create table if not exists public.staff (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  email    text not null,
  role     text not null check (role in ('admin','staff')),
  added_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null unique,
  category       text not null check (category in ('eng','chula_student','chula_staff','external')),
  round          text not null check (round in ('eng_early','general')),
  first_name     text not null,
  last_name      text not null,
  nickname       text,
  phone          text not null,
  student_id     text,
  year           text,              -- '1','2','3','4','5+','grad' (students only)
  group_code     text references public.groups(code),
  affiliation    text,              -- faculty / unit / organisation
  food_allergy   text,
  ref_code       text not null unique,
  referred_by    uuid references public.profiles(id) on delete set null,
  points         int  not null default 0 check (points >= 0),
  qr_token       uuid not null unique default gen_random_uuid(),
  checked_in_at  timestamptz,
  checked_in_by  uuid,
  consent_at     timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

create index if not exists profiles_group_idx    on public.profiles (group_code);
create index if not exists profiles_category_idx on public.profiles (category);
create index if not exists profiles_referred_idx on public.profiles (referred_by);
create index if not exists profiles_created_idx  on public.profiles (created_at);

create table if not exists public.rewards (
  id      serial primary key,
  name    text not null,
  cost    int  not null check (cost > 0),
  stock   int  check (stock is null or stock >= 0),   -- null = unlimited
  active  boolean not null default true,
  sort    int not null default 0
);

create table if not exists public.points_ledger (
  id            bigserial primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  delta         int  not null,
  reason        text not null check (reason in ('referral','signup_bonus','redeem','adjust')),
  related_user  uuid,
  reward_id     int references public.rewards(id),
  staff_id      uuid,
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists ledger_user_idx on public.points_ledger (user_id, created_at desc);

create table if not exists public.announcements (
  id          serial primary key,
  title       text not null,
  body        text not null default '',
  pinned      boolean not null default false,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------

create or replace function public.setting(k text)
returns jsonb language sql stable security definer set search_path = public as $$
  select value from public.settings where key = k
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid())
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid() and role = 'admin')
$$;

create or replace function public.gen_ref_code()
returns text language plpgsql volatile set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where ref_code = code);
  end loop;
  return code;
end $$;

-- Who is logged in, and what kind of registrant are they?
create or replace function public.my_email_info()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  em    text := lower(coalesce(auth.jwt() ->> 'email', ''));
  local text := split_part(em, '@', 1);
  cat   text;
  sid   text;
  yr    text;
  acad  int;
  entry int;
begin
  if auth.uid() is null or em = '' then
    return jsonb_build_object('logged_in', false);
  end if;

  if em like '%@student.chula.ac.th' then
    if local ~ '^[0-9]{10}$' then sid := local; end if;
    cat := case when sid is not null and right(sid, 2) = '21' then 'eng' else 'chula_student' end;
    if sid is not null then
      -- academic year (B.E.) starts in August
      acad  := extract(year from now())::int + 543
               - case when extract(month from now()) < 8 then 1 else 0 end;
      entry := 2500 + substr(sid, 1, 2)::int;
      yr := case when acad - entry + 1 between 1 and 4 then (acad - entry + 1)::text
                 when acad - entry + 1 > 4 then '5+' end;
    end if;
  elsif em like '%@chula.ac.th' then
    cat := 'chula_staff';
  else
    cat := 'external';
  end if;

  return jsonb_build_object(
    'logged_in', true,
    'email', em,
    'category', cat,
    'student_id', sid,
    'suggested_year', yr,
    'registered', exists (select 1 from public.profiles where id = auth.uid()),
    'is_staff', public.is_staff(),
    'is_admin', public.is_admin()
  );
end $$;

-- ---------------------------------------------------------------------
-- Registration
-- ---------------------------------------------------------------------

create or replace function public.register(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  info      jsonb := public.my_email_info();
  cat       text  := info ->> 'category';
  v_round   text;
  v_phone   text  := regexp_replace(coalesce(p ->> 'phone', ''), '[^0-9]', '', 'g');
  v_first   text  := btrim(coalesce(p ->> 'first_name', ''));
  v_last    text  := btrim(coalesce(p ->> 'last_name', ''));
  v_year    text  := nullif(btrim(coalesce(p ->> 'year', '')), '');
  v_group   text  := nullif(btrim(coalesce(p ->> 'group_code', '')), '');
  v_ref     text  := upper(nullif(btrim(coalesce(p ->> 'ref_code', '')), ''));
  v_referrer uuid;
  v_bonus   int   := coalesce((public.setting('points_signup_bonus'))::int, 0);
  v_per_ref int   := coalesce((public.setting('points_per_referral'))::int, 0);
  v_code    text;
begin
  if not (info ->> 'logged_in')::boolean then
    raise exception 'NOT_LOGGED_IN';
  end if;
  if (info ->> 'registered')::boolean then
    raise exception 'ALREADY_REGISTERED';
  end if;

  -- which round is open for this person?
  if (public.setting('general_round_open'))::boolean then
    if cat = 'external' and not (public.setting('allow_external'))::boolean then
      raise exception 'CHULA_ONLY';
    end if;
    v_round := 'general';
  elsif cat = 'eng' and (public.setting('eng_round_open'))::boolean then
    v_round := 'eng_early';
  elsif (public.setting('eng_round_open'))::boolean then
    raise exception 'ENG_ONLY';
  else
    raise exception 'CLOSED';
  end if;

  -- validation
  if length(v_first) not between 1 and 60 or length(v_last) not between 1 and 60 then
    raise exception 'BAD_NAME';
  end if;
  if v_phone !~ '^0[0-9]{8,9}$' then
    raise exception 'BAD_PHONE';
  end if;
  if cat in ('eng','chula_student') and (v_year is null or v_year not in ('1','2','3','4','5+','grad')) then
    raise exception 'BAD_YEAR';
  end if;
  if cat = 'eng' and (v_group is null or not exists (select 1 from public.groups where code = v_group)) then
    raise exception 'BAD_GROUP';
  end if;
  if cat <> 'eng' then v_group := null; end if;
  if cat not in ('eng','chula_student') then v_year := null; end if;
  if coalesce((p ->> 'consent')::boolean, false) is not true then
    raise exception 'NO_CONSENT';
  end if;

  if v_ref is not null then
    select id into v_referrer from public.profiles where ref_code = v_ref;
    if v_referrer is null then
      raise exception 'BAD_REF';
    end if;
  end if;

  v_code := public.gen_ref_code();

  insert into public.profiles (
    id, email, category, round, first_name, last_name, nickname, phone,
    student_id, year, group_code, affiliation, food_allergy, ref_code, referred_by
  ) values (
    auth.uid(), info ->> 'email', cat, v_round, v_first, v_last,
    nullif(left(btrim(coalesce(p ->> 'nickname', '')), 40), ''),
    v_phone, info ->> 'student_id', v_year, v_group,
    case when cat = 'eng' then 'คณะวิศวกรรมศาสตร์'
         else nullif(left(btrim(coalesce(p ->> 'affiliation', '')), 120), '') end,
    nullif(left(btrim(coalesce(p ->> 'food_allergy', '')), 200), ''),
    v_code, v_referrer
  );

  -- friend-invite points
  if v_referrer is not null and (public.setting('referral_open'))::boolean then
    if v_per_ref > 0 then
      update public.profiles set points = points + v_per_ref where id = v_referrer;
      insert into public.points_ledger (user_id, delta, reason, related_user)
        values (v_referrer, v_per_ref, 'referral', auth.uid());
    end if;
    if v_bonus > 0 then
      update public.profiles set points = points + v_bonus where id = auth.uid();
      insert into public.points_ledger (user_id, delta, reason, related_user)
        values (auth.uid(), v_bonus, 'signup_bonus', v_referrer);
    end if;
  end if;

  return jsonb_build_object('ref_code', v_code);
end $$;

create or replace function public.update_my_profile(p jsonb)
returns void language plpgsql volatile security definer set search_path = public as $$
declare
  v_phone text := regexp_replace(coalesce(p ->> 'phone', ''), '[^0-9]', '', 'g');
begin
  if v_phone !~ '^0[0-9]{8,9}$' then raise exception 'BAD_PHONE'; end if;
  update public.profiles set
    phone = v_phone,
    nickname = nullif(left(btrim(coalesce(p ->> 'nickname', '')), 40), ''),
    food_allergy = nullif(left(btrim(coalesce(p ->> 'food_allergy', '')), 200), '')
  where id = auth.uid();
end $$;

-- Points history of the logged-in user, with friend names
create or replace function public.my_points_history()
returns table (created_at timestamptz, delta int, reason text, detail text)
language sql stable security definer set search_path = public as $$
  select l.created_at, l.delta, l.reason,
         coalesce(r.name, coalesce(f.nickname, f.first_name) || ' ' || left(f.last_name, 1) || '.', l.note)
  from public.points_ledger l
  left join public.profiles f on f.id = l.related_user
  left join public.rewards  r on r.id = l.reward_id
  where l.user_id = auth.uid()
  order by l.created_at desc
  limit 200
$$;

-- ---------------------------------------------------------------------
-- Public boards
-- ---------------------------------------------------------------------

create or replace function public.public_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'registered', (select count(*) from public.profiles),
    'eng',        (select count(*) from public.profiles where category = 'eng')
  )
$$;

create or replace function public.group_leaderboard()
returns table (group_code text, registered bigint, points bigint, member_count int, pct numeric)
language sql stable security definer set search_path = public as $$
  select g.code,
         count(p.id),
         coalesce(sum(p.points), 0),
         g.member_count,
         case when g.member_count > 0 then round(count(p.id) * 100.0 / g.member_count, 1) end
  from public.groups g
  left join public.profiles p on p.group_code = g.code and p.category = 'eng'
  group by g.code, g.sort, g.member_count
  order by count(p.id) desc, g.sort
$$;

create or replace function public.top_referrers(n int default 20)
returns table (display_name text, group_code text, year text, points int, friends bigint)
language sql stable security definer set search_path = public as $$
  select coalesce(p.nickname, p.first_name) || ' ' || left(p.last_name, 1) || '.',
         p.group_code, p.year, p.points,
         (select count(*) from public.profiles f where f.referred_by = p.id)
  from public.profiles p
  where p.points > 0
  order by p.points desc, p.created_at
  limit least(greatest(n, 1), 100)
$$;

-- ---------------------------------------------------------------------
-- Staff: event-day check-in & redeem
-- ---------------------------------------------------------------------

create or replace function public.staff_lookup(q text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  r public.profiles;
  s text := btrim(coalesce(q, ''));
  by_token boolean := false;
begin
  if not public.is_staff() then raise exception 'NOT_STAFF'; end if;
  s := regexp_replace(s, '^IMF27:', '');
  if s ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select * into r from public.profiles where qr_token = s::uuid;
    by_token := true;
  else
    select * into r from public.profiles
      where ref_code = upper(s) or student_id = s or lower(email) = lower(s)
      limit 1;
  end if;
  if r.id is null then raise exception 'NOT_FOUND'; end if;
  return jsonb_build_object(
    'id', r.id, 'by_token', by_token,
    'name', r.first_name || ' ' || r.last_name, 'nickname', r.nickname,
    'category', r.category, 'student_id', r.student_id, 'year', r.year,
    'group_code', r.group_code, 'affiliation', r.affiliation,
    'food_allergy', r.food_allergy, 'points', r.points,
    'checked_in_at', r.checked_in_at
  );
end $$;

create or replace function public.staff_checkin(uid uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  t timestamptz;
begin
  if not public.is_staff() then raise exception 'NOT_STAFF'; end if;
  select checked_in_at into t from public.profiles where id = uid for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if t is not null then
    return jsonb_build_object('ok', false, 'checked_in_at', t);
  end if;
  update public.profiles set checked_in_at = now(), checked_in_by = auth.uid() where id = uid
    returning checked_in_at into t;
  return jsonb_build_object('ok', true, 'checked_in_at', t);
end $$;

create or replace function public.staff_redeem(uid uuid, reward int)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_points int;
  v_cost   int;
  v_name   text;
begin
  if not public.is_staff() then raise exception 'NOT_STAFF'; end if;
  if not (public.setting('redeem_open'))::boolean then raise exception 'REDEEM_CLOSED'; end if;

  select points into v_points from public.profiles where id = uid for update;
  if not found then raise exception 'NOT_FOUND'; end if;

  select cost, name into v_cost, v_name from public.rewards where id = reward and active;
  if v_cost is null then raise exception 'BAD_REWARD'; end if;
  if v_points < v_cost then raise exception 'NOT_ENOUGH_POINTS'; end if;

  update public.rewards set stock = stock - 1
    where id = reward and stock is not null and stock > 0;
  if not found and exists (select 1 from public.rewards where id = reward and stock is not null) then
    raise exception 'OUT_OF_STOCK';
  end if;

  update public.profiles set points = points - v_cost where id = uid returning points into v_points;
  insert into public.points_ledger (user_id, delta, reason, reward_id, staff_id)
    values (uid, -v_cost, 'redeem', reward, auth.uid());

  return jsonb_build_object('points', v_points, 'reward', v_name);
end $$;

-- ---------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------

create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  return jsonb_build_object(
    'total',      (select count(*) from public.profiles),
    'target',     coalesce((public.setting('target'))::int, 12000),
    'checked_in', (select count(*) from public.profiles where checked_in_at is not null),
    'referred',   (select count(*) from public.profiles where referred_by is not null),
    'points_out', (select coalesce(sum(delta), 0) from public.points_ledger where delta > 0),
    'points_redeemed', (select coalesce(-sum(delta), 0) from public.points_ledger where reason = 'redeem'),
    'by_category', (select coalesce(jsonb_object_agg(category, n), '{}') from
                     (select category, count(*) n from public.profiles group by category) x),
    'by_year',     (select coalesce(jsonb_object_agg(coalesce(year, '-'), n), '{}') from
                     (select year, count(*) n from public.profiles group by year) x),
    'by_group',    (select coalesce(jsonb_agg(jsonb_build_object('code', code, 'n', n) order by sort), '[]') from
                     (select g.code, g.sort, count(p.id) n from public.groups g
                       left join public.profiles p on p.group_code = g.code group by g.code, g.sort) x),
    'by_day',      (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n) order by d), '[]') from
                     (select (created_at at time zone 'Asia/Bangkok')::date d, count(*) n
                        from public.profiles group by 1) x),
    'by_reward',   (select coalesce(jsonb_agg(jsonb_build_object('name', r.name, 'n', x.n, 'stock', r.stock)), '[]') from
                     (select reward_id, count(*) n from public.points_ledger where reason = 'redeem' group by reward_id) x
                     join public.rewards r on r.id = x.reward_id)
  );
end $$;

create or replace function public.admin_list(q text default '', lim int default 50, off int default 0)
returns table (
  id uuid, email text, category text, round text, first_name text, last_name text,
  nickname text, phone text, student_id text, year text, group_code text,
  affiliation text, food_allergy text, ref_code text, referrer_code text,
  friends bigint, points int, checked_in_at timestamptz, created_at timestamptz,
  total_count bigint
) language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  return query
    select p.id, p.email, p.category, p.round, p.first_name, p.last_name, p.nickname,
           p.phone, p.student_id, p.year, p.group_code, p.affiliation, p.food_allergy,
           p.ref_code, r.ref_code,
           (select count(*) from public.profiles f where f.referred_by = p.id),
           p.points, p.checked_in_at, p.created_at,
           count(*) over ()
    from public.profiles p
    left join public.profiles r on r.id = p.referred_by
    where coalesce(q, '') = ''
       or p.first_name ilike '%' || q || '%' or p.last_name ilike '%' || q || '%'
       or p.nickname ilike '%' || q || '%' or p.email ilike '%' || q || '%'
       or p.phone like '%' || q || '%' or p.ref_code = upper(q)
       or p.student_id like q || '%'
    order by p.created_at desc
    limit least(greatest(lim, 1), 20000) offset greatest(off, 0);
end $$;

create or replace function public.admin_add_staff(em text, r text)
returns void language plpgsql volatile security definer set search_path = public, auth as $$
declare
  uid uuid;
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  if r not in ('admin','staff') then raise exception 'BAD_ROLE'; end if;
  select id into uid from auth.users where lower(email) = lower(btrim(em));
  if uid is null then raise exception 'USER_NOT_FOUND'; end if;   -- must log in once first
  insert into public.staff (user_id, email, role) values (uid, lower(btrim(em)), r)
    on conflict (user_id) do update set role = excluded.role;
end $$;

create or replace function public.admin_remove_staff(uid uuid)
returns void language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  if uid = auth.uid() then raise exception 'CANNOT_REMOVE_SELF'; end if;
  delete from public.staff where user_id = uid;
end $$;

create or replace function public.admin_adjust_points(uid uuid, delta int, note text)
returns int language plpgsql volatile security definer set search_path = public as $$
declare
  v int;
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  update public.profiles set points = points + delta where id = uid returning points into v;
  if not found then raise exception 'NOT_FOUND'; end if;
  insert into public.points_ledger (user_id, delta, reason, staff_id, note)
    values (uid, delta, 'adjust', auth.uid(), note);
  return v;
end $$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.settings      enable row level security;
alter table public.groups        enable row level security;
alter table public.staff         enable row level security;
alter table public.profiles      enable row level security;
alter table public.rewards       enable row level security;
alter table public.points_ledger enable row level security;
alter table public.announcements enable row level security;

drop policy if exists settings_read  on public.settings;
drop policy if exists settings_admin on public.settings;
create policy settings_read  on public.settings for select using (true);
create policy settings_admin on public.settings for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists groups_read  on public.groups;
drop policy if exists groups_admin on public.groups;
create policy groups_read  on public.groups for select using (true);
create policy groups_admin on public.groups for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists staff_read on public.staff;
create policy staff_read on public.staff for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles for select using (id = auth.uid());

drop policy if exists rewards_read  on public.rewards;
drop policy if exists rewards_admin on public.rewards;
create policy rewards_read  on public.rewards for select using (active or public.is_admin());
create policy rewards_admin on public.rewards for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists ledger_own on public.points_ledger;
create policy ledger_own on public.points_ledger for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists ann_read  on public.announcements;
drop policy if exists ann_admin on public.announcements;
create policy ann_read  on public.announcements for select using (published or public.is_admin());
create policy ann_admin on public.announcements for all using (public.is_admin()) with check (public.is_admin());

-- Functions: lock down, then grant what each audience needs
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.public_stats(), public.group_leaderboard(), public.top_referrers(int), public.my_email_info(),
  public.is_staff(), public.is_admin()
  to anon, authenticated;
grant execute on function
  public.register(jsonb), public.update_my_profile(jsonb), public.my_points_history(),
  public.staff_lookup(text), public.staff_checkin(uuid), public.staff_redeem(uuid, int),
  public.admin_stats(), public.admin_list(text, int, int), public.admin_add_staff(text, text),
  public.admin_remove_staff(uuid), public.admin_adjust_points(uuid, int, text),
  public.setting(text)
  to authenticated;

-- Live updates for the group leaderboard page (optional)
-- alter publication supabase_realtime add table public.profiles;
