# AnnA Revisora IA v0.1 — integração isolada
Arquivos: `validacao-coordenador/revisor-ia.html` (protótipo de interface, somente dados fictícios) e `integracoes/cloudflare/anna-revisora-ia.worker.js` (modelo de Worker protegido, **não implantado**).

## Limites
- A revisão textual sugere alterações; não julga conteúdo pedagógico.
- O revisor humano edita e confirma. Sem devolução ao professor.
- Prévia A4 e detecção inicial de transbordamento no navegador; não equivale a paginação final.
- Nenhuma liberação automática, nem escrita no Neon, nem envio à API a partir da interface nesta versão.
- O Worker atualmente publicado pelo usuário possui CORS aberto e não tem autenticação: **não enviar dados reais**.
- O modelo de Worker neste repositório exige `REVIEW_INTERNAL_TOKEN` e `GROQ_API_KEY` como secrets. Não inserir `REVIEW_INTERNAL_TOKEN` em JavaScript público. É necessário um backend autenticado entre o navegador e o Worker.
- Controle de cotas/rate limit por usuário ainda não implementado; ativar antes de usar dados reais.
- Verificar retenção, tratamento de dados e autorização institucional antes de enviar informações escolares à Groq.
- Preservadas branch principal e páginas congeladas.
