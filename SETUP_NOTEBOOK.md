# Continuar o DisMe em outro computador

Este guia prepara um notebook Windows para continuar o projeto exatamente do ponto
em que ele está no GitHub. Nenhuma senha deve ser copiada para o repositório.

## 1. Instalar no notebook

Instale:

1. **Git for Windows:** https://git-scm.com/download/win
2. **Node.js 22 LTS:** https://nodejs.org/
3. **ChatGPT/Codex para desktop:** https://developers.openai.com/pt-BR/docs/quickstart?setup=app
4. **Claude Code:** abra o PowerShell e execute:

   ```powershell
   winget install Anthropic.ClaudeCode
   ```

O Claude Code também oferece instalador nativo:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Use somente um dos dois métodos de instalação do Claude Code.

## 2. Baixar o projeto

Abra o PowerShell na pasta onde deseja guardar o projeto:

```powershell
git clone https://github.com/evoxioprofissional-code/DISME.git
cd DISME
```

Se o GitHub pedir acesso, entre na mesma conta que possui o repositório.

## 3. Recuperar as variáveis sem copiá-las pelo chat

A opção recomendada é puxar as variáveis diretamente da Vercel:

```powershell
npx vercel@latest login
npx vercel@latest link
npx vercel@latest env pull .env.local --environment=production
```

No `vercel link`, selecione o projeto existente **DISME**. O arquivo
`.env.local` é ignorado pelo Git e não deve ser enviado ao repositório.

> Atenção: o ambiente local aponta para o Supabase real. Cadastros, uploads e outras
> ações feitos localmente podem alterar dados de produção.

Alternativa: transfira o `.env.local` por um gerenciador de senhas ou unidade
criptografada. Não envie esse arquivo por chat, e-mail ou GitHub.

## 4. Preparar e validar

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-notebook.ps1
```

O script confere Git, Node, npm e as variáveis obrigatórias; depois instala as
dependências e executa o build.

Para iniciar:

```powershell
npm run dev
```

Abra http://localhost:3000.

## 5. Abrir nos agentes

### Codex

Abra o aplicativo do ChatGPT, selecione **Codex** e abra a pasta clonada `DISME`.
Na primeira mensagem:

> Leia AGENTS.md e HANDOFF_CODEX.md por completo. Continue o DisMe a partir do
> estado atual da branch main e preserve as decisões registradas nesses arquivos.

### Claude Code

Dentro da pasta do projeto:

```powershell
claude
```

Na primeira mensagem:

> Leia CLAUDE.md, AGENTS.md e HANDOFF_CODEX.md por completo antes de alterar
> qualquer arquivo. Continue a partir da branch main.

## 6. Rotina segura entre escritório e casa

Antes de começar:

```powershell
git pull --ff-only origin main
git status
```

Ao terminar, faça commit e push. Não deixe Codex e Claude Code editando a mesma
pasta ao mesmo tempo. Para usar os dois em paralelo, crie branches e pastas
separadas; para o uso normal, termine o trabalho em um antes de abrir o outro.

## Segurança

- Nunca cole tokens, senhas ou service role em conversas.
- Nunca versione `.env.local`, `.vercel` ou arquivos com credenciais.
- A senha do banco, o service role do Supabase e o token do bot do Discord já
  apareceram em conversa anterior e devem ser rotacionados.
- Depois de rotacionar, atualize Vercel e o `.env.local` do computador em uso.
