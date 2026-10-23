# Matriz de testes — convites AnnA Agenda
Estado: planejados, **não executados**.
1. JWT ausente → 401.
2. JWT inválido → 401.
3. JWT expirado → 401.
4. MASTER inexistente → 403.
5. MASTER inativo → 403.
6. Banco indisponível → 503.
7. Instituição inativa → recusar.
8. E-mail inválido → recusar.
9. Token inexistente → inválido.
10. Token expirado → inválido.
11. Token revogado → inválido.
12. Token aceito → inválido.
13. Token válido → pendente de identidade, não ativar.
14. Reutilização do token → recusar.
15. E-mail Auth diferente do convite → recusar.
16. E-mail Auth não verificado → recusar.
17. Falha Resend → não considerar entregue.
18. Envio duplicado → comportamento idempotente.
19. Corrida entre dois convites → impedir duplicação.
20. Regressão login/recuperação existentes → intactos.
