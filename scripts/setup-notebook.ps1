param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "O comando '$Name' não foi encontrado. Consulte SETUP_NOTEBOOK.md."
  }
}

Require-Command "git"
Require-Command "node"
Require-Command "npm"

$nodeVersion = (& node --version).TrimStart("v")
$nodeMajor = [int]($nodeVersion.Split(".")[0])
if ($nodeMajor -lt 22) {
  throw "Node.js 22 ou superior é necessário. Versão encontrada: $nodeVersion."
}

if (-not (Test-Path ".env.local")) {
  throw "Arquivo .env.local ausente. Puxe as variáveis da Vercel conforme SETUP_NOTEBOOK.md."
}

$requiredVariables = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DISCORD_BOT_TOKEN"
)

$envText = Get-Content -Raw ".env.local"
$missing = @()
foreach ($variable in $requiredVariables) {
  if ($envText -notmatch "(?m)^$([regex]::Escape($variable))=.+$") {
    $missing += $variable
  }
}

if ($missing.Count -gt 0) {
  throw "Variáveis ausentes no .env.local: $($missing -join ', ')."
}

if (Test-Path "node_modules") {
  Write-Host "Dependências existentes encontradas; validando com npm install..."
  & npm install
} else {
  Write-Host "Instalando dependências com npm ci..."
  & npm ci
}
if ($LASTEXITCODE -ne 0) {
  throw "A instalação falhou. Feche qualquer npm run dev aberto e execute este script novamente."
}

if (-not $SkipBuild) {
  Write-Host "Validando build de produção..."
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw "O build falhou." }
}

Write-Host ""
Write-Host "DisMe pronto neste computador."
Write-Host "Execute: npm run dev"
