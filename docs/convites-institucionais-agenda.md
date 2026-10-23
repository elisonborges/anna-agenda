# Convites institucionais — implementação planejada (Neon de testes)

## Situação
Documento técnico da integração. **Não executado**. O login, os usuários e o banco não foram modificados.

## Fluxo aprovado
1. MASTER Agenda autenticado cria instituição e informa nome, e-mail e telefone do administrador.
2. Endpoint **server-side** valida a sessão, papel global MASTER e escopo, cria convite pendente vinculado à instituição e envia e-mail ao destinatário. O navegador nunca recebe credenciais privilegiadas.
3. Destinatário abre o link de uso único e prazo curto; servidor valida hash do token, prazo, revogação e e-mail vinculado.
4. O destinatário confirma posse do e-mail por verificação controlada pelo Neon Auth e define sua senha; a ativação somente termina depois de **ambas** as comprovações. Não assumir que redefinição de senha marca e-mail como verificado.
5. Servidor cria/ativa o vínculo `institution_memberships` com `role='institution_admin'` e `active=true`, de forma idempotente, somente após validação.
6. Registrar auditoria, invalidar convite, redirecionar ao login; recuperação de senha permanece separada para usuários existentes.

## Modelo sugerido (sujeito a revisão)
`agenda_invitations`: id, institution_id, email_normalized, full_name, phone, role, token_hash, expires_at, accepted_at, revoked_at, created_by_user_id, created_at. Índices por instituição/e-mail, expiração e token_hash. Token em texto puro **nunca** no banco. Rate limiting e reenvio com revogação do anterior.

## Decisões de segurança
- Não ativar administrador por consulta pública ao banco.
- Não confiar em parâmetro de URL para indicar e-mail verificado.
- Não conceder `institution_admin` ou `agenda_master` por código no navegador.
- Não usar conta MASTER como papel institucional comum; papel global separado, concedido por operador autorizado.
- Não marcar `emailVerified=true` diretamente no banco.
- Não publicar convite funcional antes de testar verificação, expiração, repetição, escopo e falhas.

## Dependências pendentes
- Definir e implantar endpoint server-side (GitHub Pages é estático).
- Definir provedor de e-mail de produção e integração com Neon Auth.
- Escolher fluxo compatível de verificação por link: a documentação do Neon exige provedor de e-mail personalizado para links de verificação; configuração atual usa SMTP compartilhado e OTP.
- Validar mecanismos de definição de senha para conta recém-provisionada sem abrir cadastro público.
- Confirmar RLS, autorização MASTER e trilha de auditoria no ambiente isolado.

## Critério de aceite
Convite recebido → posse do e-mail confirmada → senha definida → vínculo institucional ativo → login redireciona ao painel correto, sem etapas redundantes; falhas não ativam conta nem vazam dados.
