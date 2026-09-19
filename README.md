# DisMe

Rede social feita para a cultura de usuários do Discord: descoberta de pessoas, match,
crush, Flex (status), presentes virtuais, coleções, relacionamentos e casais.

O produto usa **Supabase** para autenticação, perfis, descoberta, matches, mensagens,
presentes, coleções, Flex, rankings e relacionamentos. Não há usuários ou atividades
fictícias no banco; apenas os catálogos de jogos e presentes são semeados.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** — design tokens em `src/app/globals.css` (`@theme`)
- **motion** (Framer Motion) — usado com parcimônia
- **lucide-react** — ícones
- **Supabase** — Auth, PostgreSQL, RLS e funções transacionais

## Rodando

```bash
npm install
cp .env.example .env.local
npm run dev
```

Preencha as variáveis públicas do Supabase em `.env.local`. O app abre em
`http://localhost:3000`, exige login e conduz novos usuários ao onboarding.

```bash
npm run build   # build de produção
```

## Estrutura

```
src/
  app/
    (app)/            # experiência logada (com sidebar + bottom nav)
      home, discover, matches, messages, flex, gifts,
      rankings, couples, couple, collection, profile, notifications, settings
    login, onboarding # fora do shell
  components/         # brand, ui, nav, layout, feed, discover, gifts,
                      # flex, ranking, messages, couple, profile, settings, onboarding, icons
  data/               # metadados estáticos dos catálogos (ids/labels/ilustrações)
  lib/                # consultas, ações, Supabase, utils, labels e navegação
  types/              # modelo de domínio
supabase/migrations/  # schema, RLS, catálogos e operações seguras
scripts/              # migrations e testes de segurança
```

## Design

Dark-first (grafite), tipografia forte (Plus Jakarta Sans), roxo da marca usado com
intenção. Sem glow, gradiente decorativo, glass ou emoji na interface. Presentes são
ilustrações SVG próprias. Mobile é prioridade (bottom nav dedicado, não desktop reduzido).

## Banco e segurança

- As migrations são versionadas e aplicadas de forma incremental por `scripts/migrate.mjs`.
- RLS protege todas as tabelas.
- Saldo, Flex, matches, presentes, conversas e relacionamentos só mudam por funções
  validadas no banco; o navegador não pode alterar esses valores diretamente.
- `.env.local` é ignorado pelo Git. Nunca versione a senha do banco ou a service role.

## Próximas integrações

- Configurar credenciais do Discord no painel do Supabase (o botão já está pronto)
- Supabase Storage para upload real de avatar e banner
- Pagamentos (créditos e presentes)
- Realtime no chat e nas batalhas de Flex
- Animações específicas por presente no recebimento
