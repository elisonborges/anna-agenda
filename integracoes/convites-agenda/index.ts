// AnnA Agenda — convite institucional (rascunho isolado; NÃO implantado)
// Função server-side Deno/Supabase Edge Function. Falha fechada até a integração
// com a autorização MASTER e a emissão persistente de convites no Neon.
const headers={"Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async(req:Request)=>{
  if(req.method!=="POST")return reply({error:"Método não permitido"},405);
  // Nunca permitir chamada anônima, mesmo com chave Resend configurada.
  const bearer=req.headers.get("Authorization");
  if(!bearer?.startsWith("Bearer "))return reply({error:"Não autorizado"},401);
  // PENDENTE: verificar assinatura/audience/issuer do JWT Neon Auth no servidor,
  // checar perfil MASTER GLOBAL ativo em tabela própria e política de escopo.
  // PENDENTE: criar convite com token criptográfico, salvar somente hash no Neon,
  // estabelecer prazo, impedir duplicidade e registrar auditoria.
  // PENDENTE: após confirmação da criação do convite, enviar o e-mail pelo Resend
  // usando RESEND_API_KEY somente no servidor. Nunca receber URL livre do cliente.
  // PENDENTE: endpoint de aceitação confirma token e posse do e-mail via Neon Auth;
  // só então associa institution_memberships.
  return reply({error:"Convites indisponíveis: autorização e persistência pendentes"},503);
});
