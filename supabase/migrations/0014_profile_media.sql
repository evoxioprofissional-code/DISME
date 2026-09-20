-- DisMe — bucket de mídia de perfil (avatar/banner enviados pelo usuário).
-- Criar via migration é mais confiável que criar em runtime pela rota.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
