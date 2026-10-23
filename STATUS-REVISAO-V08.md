# Revisora IA v0.8 — validação técnica isolada

## Preparado
- Neon: memória educacional isolada com RLS, decisões humanas, eventos de liberação, permissões independentes para Revisora, Coordenação e Reprografia.
- Coordenação: página `validacao-coordenador/acompanhamento-revisao.html`, sem alterações no layout aprovado existente.
- Groq: fonte de ponte JWT/RLS `integracoes/cloudflare/anna-revisora-jwt-bridge.worker.js`, sem token interno no cliente; exige implantação Cloudflare, origem permitida e rate limiter. **Não implantado nem conectado à interface**.
- Revisora v0.8: interface para solicitar sugestão de IA preparada, porém botão desabilitado até endpoint seguro configurado.

## Testes SQL executados
- Simulação de contexto `authenticated` com JWT claims do usuário de teste: 1 vínculo de Revisora, 0 agendas, 0 liberações, 0 memórias. **Isso não prova login real nem assinatura JWT**.
- Simulação de contexto `authenticated` sem identidade: 0 vínculos, 0 agendas, 0 liberações, 0 memórias.
- Identificada e corrigida recursão de RLS nas políticas de leitura de liberações. As consultas passaram após ajuste.

## Pendências que impedem conclusão operacional
1. Implantar a ponte no Cloudflare, configurar secrets e rate limiter; validar a origem e testes de integração com Groq, usando textos fictícios.
2. Criar sessões reais dos perfis e executar testes de autenticação e fluxos com contas de teste. Não há sessão de navegador disponível para executar esses testes nesta etapa.
3. Adaptar o template A4 **exatamente** do Professor, com cabeçalho institucional, logomarcas, tabelas, imagens e paginação de impressão; as prévias atuais são simplificadas.
4. Integração visual do acompanhamento na navegação da Coordenação aprovada, após validação do layout.
5. Memória Educacional: implementar anonimização e recuperação de exemplos validados. A tabela existe, mas **não há gravação automática** nem envio de memórias à Groq.
6. Endurecer fluxo de liberação (concorrência, revisão mais recente, trilha de auditoria) e realizar testes ponta a ponta antes de uso real.

Sem publicação em produção, sem dados escolares reais enviados à IA.
