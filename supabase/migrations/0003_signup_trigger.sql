-- Auto-create a profiles row on signup. Role/display name arrive via auth metadata
-- (set by the client at signUp time); defaults to 'teen'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, handle)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'teen'),
    new.raw_user_meta_data->>'display_name',
    'keel-' || substr(replace(new.id::text, '-', ''), 1, 8)  -- anonymous default handle
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
