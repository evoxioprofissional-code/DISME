# DisMe — ponto de continuação (handoff)

Estado atualizado em 22/09/2026. Build de produção e `tsc` limpos; branch
`main` sincronizada com o GitHub.

## Ambiente
- Supabase ref `ytvewdrxquglzvssljza`, região **sa-east-1**.
- Pooler p/ migrations: host `aws-0-sa-east-1.pooler.supabase.com`, user `postgres.ytvewdrxquglzvssljza`.
- Aplicar migrations (cmd, na pasta do projeto):
  ```
  set "DBPASS=<senha do banco>"
  set "PGHOST=aws-0-sa-east-1.pooler.supabase.com"
  set "PGUSER=postgres.ytvewdrxquglzvssljza"
  node scripts/migrate.mjs
  ```
- Migrations 0001–0017 **já aplicadas** (inclui buckets `discord-history`, `profile-media`, `marketplace-media` e `store-media`).
- Segredos só em `.env.local` (gitignored): anon, service_role, `DISCORD_BOT_TOKEN`. **Recomendo rotacionar** (passaram pelo chat). Opcional: `OATHNET_API_KEY`, `NAMEDC_API_TOKEN`.
- Produção: `https://www.disme.cloud`.
- Para preparar outro computador, siga `SETUP_NOTEBOOK.md`.

## Feito nesta sessão
1. **Consulta Discord (`/discord`)** enriquecida com tudo da API oficial de bot: nameplate/colecionável, enfeite de avatar (+expiração), banner/cor, "Provável Nitro", flairs (OG/antiga/animada), badges (public_flags), tag de clã, e seção **Detalhes técnicos** (snowflake, idade em dias, public flags, avatar hash). Avatares/banners são **arquivados no Supabase Storage** a cada consulta (histórico com imagem mesmo após o Discord apagar do CDN).
2. **Navegação sem login**: o app abre por dentro para visitantes. `src/proxy.ts` não redireciona mais; o cadastro é pedido **na ação** via `AuthProvider` (`src/components/auth/AuthProvider.tsx`, hook `useAuthGate().requireAuth()`). Já aplicado em Descobrir (curtir/crush), Perfil (presentear/mensagem/relacionamento) e Presentes (enviar).
3. **Configurações**: e-mail real (da sessão), botão **Sair** funcionando (server action `signOut`), **conexões** Steam/Spotify/Riot/Twitch conectáveis (salvam em `connections` via `upsertConnection`/`removeConnection`).
4. Páginas pessoais (matches, mensagens, notificações, flex, editar perfil, configurações) mostram **CTA de login** (`LoginCta`) para visitantes, em vez de redirecionar.
5. **Discord OAuth configurado**: o callback consulta `/users/@me` com o token
   autorizado e preenche nome, username, avatar, banner e conexão Discord no
   primeiro cadastro. O onboarding inicia com nome, @ e foto preenchidos.
6. **Upload real de avatar**: onboarding e edição de perfil aceitam JPG, PNG,
   WebP e GIF de até 4 MB. A rota `/api/profile/avatar` cria e usa o bucket
   público `profile-media` com credenciais server-only.
7. **Marketplace + Exposições**: `/marketplace` separa anúncios comerciais de
   uma vitrine de contas. Anúncios aceitam itens, serviços, periféricos e
   colecionáveis; o acordo ocorre diretamente no Discord, sem pagamento no
   DisMe. Contas só podem usar o modo `showcase`: sem preço, compra, troca,
   transferência ou CTA comercial. A restrição também existe no banco. Inclui
   até 5 imagens, busca, categorias, favoritos, denúncia e página detalhada.
8. **Lojas de usuários**: cada perfil pode criar uma loja com nome, URL, logo,
   capa, descrição e visibilidade. O Marketplace abre pela vitrine de lojas;
   produtos e exposições pertencem obrigatoriamente a uma loja. O painel
   `/store/manage` permite criar, editar, pausar/reativar e excluir publicações.
   A loja também aparece no perfil público.
9. **Capa de perfil**: `/profile/edit` agora envia e salva capa real no bucket
   `profile-media`, além do avatar já existente.
10. **Diretório de servidores**: donos podem anunciar servidores na aba
    `Servidores` do Marketplace. O bot precisa estar no servidor; o backend
    compara o `owner_id` oficial da guilda ao Discord ID verificado do perfil.
    Importa nome, ícone, banner, descrição, totais de membros/online, boosts,
    nível, canais, cargos, emojis, idioma e features. Não coleta a lista
    individual de membros. Há sincronização, edição, ocultação e exclusão em
    `/servers/manage`, e os anúncios aparecem no perfil do dono.

## Limites honestos já explicados ao dono
- **Badges "coloridas" (Nitro, Boost, Quest, Orbs, tag)**: NÃO vêm no `public_flags` da API de bot. Só via endpoint de profile (token de usuário/self-bot = proibido, ToS) ou API de terceiro. As de `public_flags` (Staff/HypeSquad/Bug Hunter/Early Supporter/Active Developer) já funcionam.
- **Histórico retroativo de nomes**: só via OathNet (pago, ~US$9,99/mês, plano Iniciante) — e **só nomes, não avatares**. Já plugado, falta a chave.
- **Nitro real / bio / conexões de terceiros**: não dá sem self-bot.

## Pendências sugeridas (para o Codex)
- [FEITO] "Provável Nitro" → "Nitro" quando há recurso exclusivo (`nitroConfirmed` em `src/lib/discord.ts` + chip em `DiscordLookup.tsx`).
- [FEITO] Toggle "Ocultar perfil" persiste em `profiles.is_hidden` (`setProfileHidden`); edição de perfil reflete o mesmo.
- Menu "Mais opções" do perfil (Bloquear/Denunciar) ainda é no-op — precisa de tabelas novas (`blocks`, `reports`) via migration + ações. (Não apliquei: o sandbox do Claude bloqueia rodar migrations/gravações de PII; rode `node scripts/migrate.mjs`.)
- Demais toggles de Configurações (Aparecer em Descobrir, Mostrar online, só matches, notificações) ainda são locais — faltam colunas no `profiles` (migration) + gravação.
- Extra por-servidor (apelido/cargos/boost) só se o bot estiver no mesmo servidor do alvo (não pra qualquer ID).
