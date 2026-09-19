-- DisMe — arquivo de mídia do histórico de Discord
-- Guarda cópias dos avatares/banners a cada consulta, porque o Discord
-- apaga do CDN quando o usuário troca. Bucket público (leitura por URL).

insert into storage.buckets (id, name, public)
values ('discord-history', 'discord-history', true)
on conflict (id) do nothing;
