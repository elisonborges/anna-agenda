# AnnA Agenda — plano fechado de implantação
Data: 2026-10-23
Estado: planejamento consolidado. **Não é autorização para publicar produção.**

## 1. Arquitetura
- Interface estática existente: GitHub Pages, sem credenciais privilegiadas.
- Identidade: Neon Auth da branch de testes.
- Dados: Neon PostgreSQL da branch de testes (institutions, institution_memberships, agenda_master_memberships, agenda_invitations, agenda_invitation_audit).
- Endpoints: funções Deno server-side isoladas, em hospedagem a confirmar; sem implantação até configurar segredos e rate limiting.
- E-mail: Resend, remetente/domínio verificados antes de habilitar.
- Segredos somente no servidor: NEON_AUTH_BASE_URL, AGENDA_NEON_DATABASE_URL, RESEND_API_KEY. Nunca no navegador.
- Não usar Supabase de Projetos Escolares como banco da Agenda.

## 2. Ativação institucional
1. MASTER autenticado e autorizado no banco solicita convite para instituição ativa.
2. Servidor valida entrada, impede duplicidade concorrente, cria token aleatório e armazena apenas hash, prazo e auditoria.
3. Envio Resend; registrar sucesso/falha. Falha não equivale a convite entregue.
4. Destinatário abre URL individual; endpoint confirma status pendente, expiração e instituição ativa, sem expor dados pessoais.
5. Neon Auth comprova posse do **mesmo e-mail convidado** via mecanismo oficial. A configuração de verificação OTP e cadastro deve ser revisada antes da implantação.
6. Usuário define senha com Neon Auth; servidor valida sessão assinada e estado real de e-mail verificado.
7. Transação atômica marca convite aceito e cria/ativa membership institutional_admin, com auditoria. Repetição não gera privilégio adicional.
8. Redirecionar ao login/painel. Login e reset atuais permanecem preservados.

## 3. Segurança
- JWT verificado por JWKS, emissor, audiência e validade; MASTER verificado no Neon server-side.
- Convite de uso único, hash SHA-256, 24 horas, revogação e prevenção de concorrência.
- RLS habilitada; acesso público revogado para tabelas sensíveis.
- CORS restrito não substitui autenticação. Aplicar rate limiting distribuído nos endpoints públicos.
- Rejeitar corpo excessivo, URLs não autorizadas, e-mail não verificado, e-mail divergente, instituição inativa e MASTER revogado.
- Nunca marcar emailVerified diretamente no banco, nem inferir verificação da URL.
- Auditoria sem token bruto ou senha; logar criação, envio, falha, revogação e aceite.
- Confirmar remetente Resend; agenda@annaone.com.br ainda é candidato não verificado.

## 4. Aceitação
- MASTER ativo autorizado; MASTER inativo negado; JWT ausente/inválido/expirado negado.
- Convite válido é entregue, consulta funciona, expiração/revogação bloqueiam.
- E-mail divergente ou não verificado nunca ativa.
- Aceite simultâneo/repetido produz um único vínculo institucional e auditoria consistente.
- Erro Resend e indisponibilidade Neon não produzem falsa ativação.
- Nenhum usuário consegue acesso a instituição alheia.
- Login, recuperação de senha e telas atuais continuam funcionando.
- Testes automatizados + teste ponta a ponta no ambiente isolado obrigatórios; ainda não executados.

## 5. Publicação e reversão
1. Confirmar hospedagem das funções, segredos, origem permitida, domínio Resend e identidade MASTER de teste.
2. Implantar somente em ambiente de testes; verificar logs, respostas, banco e e-mail.
3. Corrigir falhas, testar regressões e registrar evidências.
4. Solicitar aprovação explícita para produção.
5. Publicar por etapas; manter versão anterior pronta para rollback de frontend e endpoints.
6. Não apagar tabelas/dados nem migrar contas reais automaticamente; monitorar erros e auditoria após ativação.

## Pendências bloqueadoras de implantação real
- Hospedagem e proteção contra abuso para os endpoints Deno.
- Integração completa e verificada da prova de e-mail/senha via Neon Auth.
- Endpoint de aceite atômico com membership e auditoria.
- Conexão controlada entre persistência, Resend e compensação de falha.
- Testes em execução e aprovação expressa de publicação.

## Referências de código isolado
integracoes/convites-agenda/index.ts
integracoes/convites-agenda/persist-invitation.ts
integracoes/convites-agenda/resend-email.ts
integracoes/convites-agenda/validar-convite.ts
integracoes/convites-agenda/activation-contract.ts
integracoes/convites-agenda/README.md
