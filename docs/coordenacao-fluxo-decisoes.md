# Modo Coordenador — implementação em desenvolvimento

## Ambientes
- GitHub: `desenvolvimento-seguranca` (não publicado).
- Neon de validação: `agenda-revisao-isolada` (`br-young-shadow-b6t18lma`).
- Neon operacional: `desenvolvimento-seguranca` (`br-spring-union-b6h5u9pj`), **não alterado nesta etapa**.

## Implementado
1. Migração `migrations/20261022_coordinator_decision_test.sql`: função transacional `register_coordinator_decision_test`, proteção do conteúdo após envio, política RLS para o professor ler as devolutivas e bloqueio de INSERT direto no histórico.
2. `coordenacao.html`: registra decisão e atualiza situação por RPC, exige conferência e observação em esclarecimento, atualiza a listagem após sucesso.
3. `index.html`: professor pode selecionar um lançamento e consultar o histórico autorizado de decisões, sem alterar conteúdos.

## Validações executadas
- Migração aplicada apenas na branch Neon isolada.
- Função SECURITY DEFINER instalada, EXECUTE autorizado para `authenticated` e negado a `anonymous`.
- INSERT direto na tabela de histórico negado a `authenticated`.
- Política de leitura de devolutiva do professor instalada.
- Tentativa de decisão sem JWT negada; nenhuma decisão criada no teste.
- **Não foi realizado teste de ponta a ponta com sessão real de coordenador/professor.**

## Antes de publicar
- Testar o fluxo completo com contas de teste autorizadas: enviado → em análise → esclarecimento → liberado.
- Confirmar que histórico, autoria e observações aparecem para professor e Coordenação.
- Revisar a migração e testar em staging com API e cache de esquema atualizados.
- Somente após aprovação explícita aplicar migração no Neon operacional e publicar o site.
