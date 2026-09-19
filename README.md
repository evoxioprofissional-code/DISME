# DisMe

Rede social feita para a cultura de usuários do Discord: descoberta de pessoas, match,
crush, Flex (status), presentes virtuais, coleções, relacionamentos e casais.

Esta fase é **front-end com dados mockados** — sem backend, pagamentos ou OAuth reais,
mas estruturada para essas integrações depois.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** — design tokens em `src/app/globals.css` (`@theme`)
- **motion** (Framer Motion) — usado com parcimônia
- **lucide-react** — ícones

## Rodando

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000` e redireciona para `/home` (produto logado).

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
  data/               # mocks: usuários, jogos, presentes, feed, ranking, casais, coleções
  lib/                # utils, labels, navegação
  types/              # modelo de domínio
```

## Design

Dark-first (grafite), tipografia forte (Plus Jakarta Sans), roxo da marca usado com
intenção. Sem glow, gradiente decorativo, glass ou emoji na interface. Presentes são
ilustrações SVG próprias. Mobile é prioridade (bottom nav dedicado, não desktop reduzido).

## Próximas integrações (planejadas)

- Autenticação com Discord (OAuth) + e-mail
- Supabase (dados, auth, storage) — avatares hoje via `i.pravatar.cc` (placeholder)
- Pagamentos (créditos e presentes)
- Realtime no chat e nas batalhas de Flex
- Animações específicas por presente no recebimento
