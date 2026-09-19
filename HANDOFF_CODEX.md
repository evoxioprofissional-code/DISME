# DisMe — ponto de continuação (handoff)

Última sessão (Claude). Build de produção **limpo**, `tsc` limpo, tudo commitado e no GitHub (branch `main`).

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
- Migrations 0001–0013 **já aplicadas** (inclui bucket `discord-history` p/ arquivo de avatares).
- Segredos só em `.env.local` (gitignored): anon, service_role, `DISCORD_BOT_TOKEN`. **Recomendo rotacionar** (passaram pelo chat). Opcional: `OATHNET_API_KEY`, `NAMEDC_API_TOKEN`.

## Feito nesta sessão
1. **Consulta Discord (`/discord`)** enriquecida com tudo da API oficial de bot: nameplate/colecionável, enfeite de avatar (+expiração), banner/cor, "Provável Nitro", flairs (OG/antiga/animada), badges (public_flags), tag de clã, e seção **Detalhes técnicos** (snowflake, idade em dias, public flags, avatar hash). Avatares/banners são **arquivados no Supabase Storage** a cada consulta (histórico com imagem mesmo após o Discord apagar do CDN).
2. **Navegação sem login**: o app abre por dentro para visitantes. `src/proxy.ts` não redireciona mais; o cadastro é pedido **na ação** via `AuthProvider` (`src/components/auth/AuthProvider.tsx`, hook `useAuthGate().requireAuth()`). Já aplicado em Descobrir (curtir/crush), Perfil (presentear/mensagem/relacionamento) e Presentes (enviar).
3. **Configurações**: e-mail real (da sessão), botão **Sair** funcionando (server action `signOut`), **conexões** Steam/Spotify/Riot/Twitch conectáveis (salvam em `connections` via `upsertConnection`/`removeConnection`).
4. Páginas pessoais (matches, mensagens, notificações, flex, editar perfil, configurações) mostram **CTA de login** (`LoginCta`) para visitantes, em vez de redirecionar.

## Limites honestos já explicados ao dono
- **Badges "coloridas" (Nitro, Boost, Quest, Orbs, tag)**: NÃO vêm no `public_flags` da API de bot. Só via endpoint de profile (token de usuário/self-bot = proibido, ToS) ou API de terceiro. As de `public_flags` (Staff/HypeSquad/Bug Hunter/Early Supporter/Active Developer) já funcionam.
- **Histórico retroativo de nomes**: só via OathNet (pago, ~US$9,99/mês, plano Iniciante) — e **só nomes, não avatares**. Já plugado, falta a chave.
- **Nitro real / bio / conexões de terceiros**: não dá sem self-bot.

## Pendências sugeridas (para o Codex)
- (opcional) Trocar "Provável Nitro" → "Nitro" quando há nameplate/enfeite (são exclusivos de Nitro). Onde: `src/lib/discord.ts` (`nitroLikely`) + chip em `src/components/discord/DiscordLookup.tsx`.
- Menu "Mais opções" do perfil (Bloquear/Denunciar/Ocultar) ainda é no-op — falta ação real.
- Toggles de privacidade/notificações em Configurações são locais (não persistem) — falta gravar no perfil.
- Fluxo Discord OAuth: botão pronto; falta o dono pôr Client ID/Secret no painel do Supabase.
- Extra por-servidor (apelido/cargos/boost) só se o bot estiver no mesmo servidor do alvo (não pra qualquer ID).
