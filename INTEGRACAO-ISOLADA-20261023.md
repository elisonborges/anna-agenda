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

## Implementação adicional — integração

- Criada no **branch Neon de teste** a função `public.agenda_lookup_teacher_test(p_email)`, que substitui a dependência inexistente de `user_profiles`.
- A função exige **e-mail exato**, limita os resultados a vínculos ativos na mesma instituição de um coordenador/administrador autenticado, exige conta verificada e não banida, e retorna apenas atribuições escolares. A execução foi concedida ao papel `authenticated`; `PUBLIC` foi revogado.
- Atualizada a consulta `Consultar` da Coordenação **somente na branch GitHub isolada** para usar a nova RPC.
- Reabilitada a visualização do workspace Neon de atribuições e rascunhos do Professor **somente na branch isolada**, aproveitando o código de salvamento, abertura e envio que já existia, sem reescrevê-lo.
- Confirmadas no esquema de teste políticas RLS para leitura e gravação dos lançamentos, acesso do professor às próprias agendas e acesso da Coordenação às agendas enviadas e ao histórico.
- Teste SQL sem JWT para a busca de um e-mail inexistente retornou zero registros. ACL da RPC conferida: apenas owner e `authenticated` podem executá-la.

## Limites de validação
- **Não houve teste ponta a ponta com contas autenticadas de professor, coordenador e administrador.** A existência das políticas RLS não comprova seu comportamento em sessões reais.
- **Não foi validado** que a URL de Data API embutida no HTML aponta para o mesmo branch Neon isolado no qual a RPC foi criada. Até confirmar essa correspondência, a consulta poderá retornar HTTP 404 no navegador.
- O workspace Neon do Professor é um editor autenticado separado, já existente; a migração para o formulário principal aprovado ainda está pendente e não deve ser anunciada como concluída.
- A Coordenação já possuía filtros e histórico autenticado no código; sua execução com dados reais e integração completa com o formulário principal continuam pendentes.
- Não foram alterados dados escolares, registros de agendas ou páginas na branch principal.

## Formulário principal do Professor — integração direta (commit 3484e2d)

- Inseridos controles Neon ao lado do botão original **Salvar atividade para revisão**, sem substituir a lógica local aprovada.
- O novo salvamento utiliza **os campos originais** `classContent`, `classActivity`, `homeActivity` e a data `day`.
- Seleção de atribuição a partir dos vínculos institucionais autenticados e atribuições retornadas pelas políticas RLS.
- Operações POST (novo rascunho), PATCH (rascunho existente), GET (listagem) e abertura do rascunho no **mesmo formulário principal**.
- Conteúdo HTML limitado a elementos de texto, ênfase e listas; imagens não são persistidas por esta integração.
- O editor Neon paralelo continua oculto. Nenhum campo do formulário aprovado foi removido.
- Os botões Neon são separados do botão local de demonstração; o envio à Coordenação não foi acoplado a esta implementação.
- O código foi gravado na branch isolada; **não houve teste autenticado de ponta a ponta**, nem publicação.
- Atenção: a API Neon embutida no HTML ainda precisa ter sua correspondência com o branch Neon de teste confirmada antes de qualquer uso com dados reais.
