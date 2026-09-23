# Plano de seed do perfil @venvsbuscas

Este documento é apenas um plano. Nenhuma instrução abaixo foi executada e nenhum dado remoto foi alterado.

## Perfil alvo

- `profiles.id`: `f6f2058f-a68b-46b1-a3ea-42918b2bdc83`
- `username`: `venvsbuscas`
- Flex desejado: `18.420`
- Ranking: derivado pela view `flex_ranking`; nunca gravar `#1` como texto.

## Estado alvo

### Recebidos — 47 registros em `owned_gifts`

- `rosa` / Heartbroken: 12
- `carta` / e-kitten: 9
- `ursinho` / Aura: 8
- `cafe` / Lighter: 6
- `controle` / Lean: 5
- `alianca` / Masked: 3
- `coroa` / Void: 2
- `galaxia` / Dragon: 2

Os 47 registros terão `owner_id` igual ao perfil alvo. Para que sejam considerados presentes recebidos, precisam de `from_id` válido. Não usar usuários reais aleatórios. Antes de executar qualquer seed, criar ou escolher uma conta técnica/fixture explicitamente autorizada e oculta da descoberta, ou aguardar envios orgânicos.

### Enviados — 31 registros em `owned_gifts`

Os 31 registros terão `from_id` igual ao perfil alvo e `owner_id` apontando para destinatários válidos e previamente autorizados. Não inventar relações com usuários reais.

Uma combinação exata usando os preços atuais seria:

- 11 × `rosa` a 40 = 440
- 1 × `carta` a 60 = 60
- 2 × `galaxia` a 1.200 = 2.400
- 1 × `eclipse` a 3.500 = 3.500
- 16 × `trono` a 5.000 = 80.000
- Total: 31 presentes e 86.400 créditos históricos

Essa combinação consumiria unidades limitadas (`eclipse` e `trono`) por causa do trigger de `minted`. Portanto, **não é recomendada para produção sem decisão explícita de produto**. Sem itens de maior valor não limitados, não é possível atingir 86.400 em apenas 31 envios usando os preços atuais. Alternativas seguras:

1. manter os números reais até ocorrerem envios orgânicos;
2. criar futuramente um gift não limitado de maior valor, com asset e decisão de catálogo;
3. autorizar conscientemente o consumo das unidades limitadas e destinatários de fixture.

Nunca preencher `credits_spent` com um valor diferente do preço efetivamente representado apenas para alcançar o total.

## Destaques

Depois dos 47 registros recebidos e após aplicar a migration `0022_profile_gift_showcase.sql`, usar a função segura `set_profile_featured_gifts` autenticado como o próprio perfil, ou inserir administrativamente com auditoria:

1. `galaxia` / Dragon — posição 1
2. `coroa` / Void — posição 2
3. `alianca` / Masked — posição 3

O banco valida que os três gifts pertencem à coleção do perfil.

## Flex e ranking

- Atualizar apenas `profiles.flex` do perfil alvo para `18420` em uma operação administrativa auditada.
- A posição vem automaticamente de `flex_ranking`, que usa `rank() over (order by flex desc)`.
- Empates recebem a mesma posição. Se outro usuário ultrapassar 18.420, o perfil muda de posição naturalmente.

## Tabelas afetadas

- `profiles`: somente `flex`; os caches `gifts_received`, `gifts_sent` e `collection_count` são reconciliados pela migration 0022.
- `owned_gifts`: 47 recebidos e 31 enviados, com `credits_spent` congelado nos envios.
- `profile_featured_gifts`: 3 registros.
- `gifts`: o trigger incrementa `minted` para gifts limitados; revisar antes de qualquer execução.
- `feed_activities`: nenhuma inserção é necessária para o novo perfil, pois a atividade de presentes é derivada de `owned_gifts`.

## Integridade e efeitos econômicos

- Não criar `credit_purchases`, webhooks, PIX, pagamentos ou eventos NexusPag.
- Não aumentar `profiles.credits` e não criar saldo disponível.
- O seed de histórico não deve chamar `send_gift`, pois isso descontaria créditos atuais e concederia Flex pelo fluxo econômico real.
- Inserções administrativas em `owned_gifts` representam importação histórica, não pagamentos.
- Usar uma transação única e validar contagens antes do commit.
- Validar após a operação: 47 recebidos, 31 enviados, soma de `credits_spent` 86.400, 8 gifts distintos recebidos, 3 destaques válidos e Flex 18.420.
- Fazer rollback se qualquer validação falhar.

## Pré-condições para um script executável

1. aplicar e revisar a migration 0022;
2. decidir como tratar o consumo de gifts limitados;
3. fornecer contas de fixture/autorizadas para remetentes e destinatários;
4. aprovar explicitamente a importação histórica em produção;
5. criar backup e executar primeiro em ambiente de staging.

Enquanto essas condições não forem atendidas, este plano não deve virar seed executável.
