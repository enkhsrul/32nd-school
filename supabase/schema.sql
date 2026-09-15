
create extension if not exists "uuid-ossp";

do $$ begin
  create type public.user_role as enum ('ADMIN','TEACHER','STUDENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('PRESENT','ABSENT','SICK','LEAVE','LATE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.grade_type as enum ('ASSIGNMENT','QUIZ','EXAM','CLASSWORK','PARTICIPATION');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  role public.user_role not null default 'STUDENT',
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.classes (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  grade_level integer not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  code text unique,
  created_at timestamptz default now()
);

create table if not exists public.students (
  profile_id uuid references public.profiles(id) on delete cascade primary key,
  student_id_code text unique not null,
  class_id uuid references public.classes(id) on delete set null,
  enrollment_year integer not null,
  status text default 'ACTIVE'
);

create table if not exists public.class_subjects (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade,
  unique(class_id,subject_id,teacher_id)
);

create table if not exists public.assignments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  subject_id uuid references public.subjects(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade,
  due_date timestamptz not null,
  max_score integer default 100 check(max_score > 0),
  attachment_url text,
  created_at timestamptz default now()
);

create table if not exists public.submissions (
  id uuid default uuid_generate_v4() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  content text,
  file_url text,
  submitted_at timestamptz default now(),
  unique(assignment_id,student_id)
);

create table if not exists public.grades (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade,
  score numeric(5,2) not null check(score >= 0 and score <= 100),
  type public.grade_type not null,
  period text not null,
  created_at timestamptz default now()
);

create table if not exists public.attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  date date not null default current_date,
  status public.attendance_status not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  unique(student_id,date)
);

create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  participant_1 uuid not null references public.profiles(id) on delete cascade,
  participant_2 uuid not null references public.profiles(id) on delete cascade,
  updated_at timestamptz default now(),
  constraint participant_order check(participant_1 < participant_2),
  unique(participant_1,participant_2)
);

create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  content text not null check(length(trim(content)) > 0),
  is_read boolean default false,
  created_at timestamptz default now()
);

create or replace function public.get_auth_role()
returns public.user_role
language sql stable security definer set search_path=public
as $$ select role from public.profiles where id=auth.uid() $$;

-- New Auth user -> profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path=public
as $$
begin
  insert into public.profiles(id,first_name,last_name,email,role)
  values(
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name','User'),
    coalesce(new.raw_user_meta_data->>'last_name',''),
    new.email,
    'STUDENT'
  )
  on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.students enable row level security;
alter table public.class_subjects enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.grades enable row level security;
alter table public.attendance enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Clean policies so the script can be rerun.
do $$ declare r record; begin
  for r in select schemaname,tablename,policyname from pg_policies where schemaname='public'
  loop execute format('drop policy if exists %I on %I.%I',r.policyname,r.schemaname,r.tablename); end loop;
end $$;

-- Profiles
create policy profiles_select_self on public.profiles for select using(auth.uid()=id or public.get_auth_role() in ('ADMIN','TEACHER'));
create policy profiles_admin_all on public.profiles for all using(public.get_auth_role()='ADMIN') with check(public.get_auth_role()='ADMIN');
create policy profiles_update_self on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id and role=(select role from public.profiles where id=auth.uid()));

-- Classes / subjects
create policy classes_select_auth on public.classes for select using(auth.uid() is not null);
create policy classes_admin_all on public.classes for all using(public.get_auth_role()='ADMIN') with check(public.get_auth_role()='ADMIN');
create policy subjects_select_auth on public.subjects for select using(auth.uid() is not null);
create policy subjects_admin_all on public.subjects for all using(public.get_auth_role()='ADMIN') with check(public.get_auth_role()='ADMIN');

-- Students
create policy students_self on public.students for select using(profile_id=auth.uid());
create policy students_teacher on public.students for select using(
  public.get_auth_role()='TEACHER' and exists(
    select 1 from public.classes c where c.id=students.class_id and c.teacher_id=auth.uid()
  )
);
create policy students_admin on public.students for all using(public.get_auth_role()='ADMIN') with check(public.get_auth_role()='ADMIN');

-- Class subjects
create policy class_subjects_auth_select on public.class_subjects for select using(auth.uid() is not null);
create policy class_subjects_admin on public.class_subjects for all using(public.get_auth_role()='ADMIN') with check(public.get_auth_role()='ADMIN');

-- Assignments
create policy assignments_student_select on public.assignments for select using(
  exists(select 1 from public.students s where s.profile_id=auth.uid() and s.class_id=assignments.class_id)
);
create policy assignments_teacher_all on public.assignments for all using(
  public.get_auth_role()='TEACHER' and teacher_id=auth.uid()
) with check(public.get_auth_role()='TEACHER' and teacher_id=auth.uid());
create policy assignments_admin_all on public.assignments for all using(public.get_auth_role()='ADMIN') with check(public.get_auth_role()='ADMIN');

-- Submissions
create policy submissions_student_all on public.submissions for all using(student_id=auth.uid()) with check(student_id=auth.uid());
create policy submissions_teacher_select on public.submissions for select using(
  public.get_auth_role()='TEACHER' and exists(select 1 from public.assignments a where a.id=submissions.assignment_id and a.teacher_id=auth.uid())
);

-- Grades
create policy grades_student_select on public.grades for select using(student_id=auth.uid());
create policy grades_teacher_all on public.grades for all using(
  public.get_auth_role()='TEACHER' and teacher_id=auth.uid()
) with check(public.get_auth_role()='TEACHER' and teacher_id=auth.uid());
create policy grades_admin_all on public.grades for all using(public.get_auth_role()='ADMIN') with check(public.get_auth_role()='ADMIN');

-- Attendance
create policy attendance_student_select on public.attendance for select using(student_id=auth.uid());
create policy attendance_teacher_all on public.attendance for all using(public.get_auth_role()='TEACHER' and teacher_id=auth.uid())
with check(public.get_auth_role()='TEACHER' and teacher_id=auth.uid());
create policy attendance_admin_all on public.attendance for all using(public.get_auth_role()='ADMIN') with check(public.get_auth_role()='ADMIN');

-- Conversations / messages
create policy conversations_participant on public.conversations for all using(auth.uid() in(participant_1,participant_2))
with check(auth.uid() in(participant_1,participant_2));
create policy messages_participant_select on public.messages for select using(
  exists(select 1 from public.conversations c where c.id=messages.conversation_id and auth.uid() in(c.participant_1,c.participant_2))
);
create policy messages_insert_sender on public.messages for insert with check(
  sender_id=auth.uid() and exists(
    select 1 from public.conversations c where c.id=messages.conversation_id and auth.uid() in(c.participant_1,c.participant_2)
  )
);
create policy messages_update_read on public.messages for update using(
  exists(select 1 from public.conversations c where c.id=messages.conversation_id and auth.uid() in(c.participant_1,c.participant_2))
);

-- Useful starter subjects.
insert into public.subjects(name,code) values
('Математик','MATH'),('Англи хэл','ENG'),('Монгол хэл','MON'),('Мэдээллийн технологи','IT')
on conflict(name) do nothing;

-- IMPORTANT:
-- After your first account is created, run:
-- update public.profiles set role='ADMIN' where email='YOUR_ADMIN_EMAIL';
-- Then refresh the app.