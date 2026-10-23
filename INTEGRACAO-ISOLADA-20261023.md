# Ciclo isolado de integração — AnnA Agenda Educacional

Branch: `integracao-isolada-agenda-20261023`. Base: `main`. Sem publicação no GitHub Pages e sem alterações na branch principal.

## Implementado
- Página independente `validacao-coordenador/diagnostico-integracao.html`, sem alterar as três páginas congeladas.
- Diagnóstico de sessão Neon Auth e token de acesso.
- Consulta autenticada de vínculos institucionais, papéis e atribuições ativas.
- Verificação de integridade referencial entre atribuição, turma, disciplina e unidade, restrita às linhas visíveis ao usuário.
- Consulta dos lançamentos autenticados do usuário e conferência das atribuições correspondentes.
- Identificação do perfil de Coordenação; aviso explícito de que isso não comprova políticas RLS.
- Consultas somente leitura, com mensagens de erro e sem exibição de tokens ou informações pessoais.

## Confirmado no esquema Neon de teste
Tabelas presentes: `institution_memberships`, `teacher_class_assignments`, `school_classes`, `school_subjects`, `school_units`, `agenda_authenticated_entries_test` e `agenda_coordinator_reviews_test`.
A tabela `user_profiles` **não existe** no esquema público de teste. A função "Consultar professor" da Coordenação atual tenta consultá-la e não pode ser considerada operacional.

## Pendente
- Executar diagnóstico com contas reais de teste (professor e coordenador) e confirmar as políticas de acesso; a inspeção de esquema não substitui autenticação.
- Definir uma fonte de identidade autorizada para busca de professores, sem exposição de contas entre instituições.
- Validar operações de escrita e histórico no ambiente isolado antes de qualquer ativação.
- Revisar limites de paginação e visibilidade de consultas; o diagnóstico consulta até 1.000 registros por recurso.
- Confirmar que o ambiente Neon consumido pelas páginas corresponde ao branch de teste pretendido.

## Restrições respeitadas
Não alteradas as páginas `login.html`, `professor.html` e `coordenacao.html` neste ciclo. Nenhuma escrita SQL, alteração de dados reais, publicação ou alteração de produção.
