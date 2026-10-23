// AnnA Revisora IA — modelo de Worker protegido, ainda NÃO implantado.
// A chave GROQ_API_KEY e o segredo REVIEW_INTERNAL_TOKEN devem ser Secrets do Cloudflare.
// IMPORTANTE: REVIEW_INTERNAL_TOKEN só pode ser enviado por um backend autenticado,
// NUNCA pelo navegador, GitHub Pages ou código público.
const MAX_LENGTH=12000;
export default {
 async fetch(request,env){
  const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(request.method!=='POST')return reply({erro:'Método não permitido'},405);
  if(!env.REVIEW_INTERNAL_TOKEN||!env.GROQ_API_KEY)return reply({erro:'Serviço não configurado'},503);
  const provided=request.headers.get('Authorization')||'';
  if(provided!==('Bearer '+env.REVIEW_INTERNAL_TOKEN))return reply({erro:'Não autorizado'},401);
  const length=Number(request.headers.get('Content-Length')||0);
  if(length>20000)return reply({erro:'Solicitação muito extensa'},413);
  let body;try{body=await request.json()}catch{return reply({erro:'JSON inválido'},400)}
  if(typeof body?.texto!=='string'||!body.texto.trim()||body.texto.length>MAX_LENGTH)return reply({erro:'Texto inválido'},400);
  try{
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
   let response;
   try{response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',signal:controller.signal,headers:{Authorization:'Bearer '+env.GROQ_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'openai/gpt-oss-120b',temperature:0,max_completion_tokens:1800,messages:[{role:'system',content:'Revise somente ortografia, gramática, pontuação e digitação em português. Não avalie pedagogia, atividades, metodologia ou objetivos. Não altere o sentido nem acrescente informações. Retorne somente o texto corrigido. A revisão é uma sugestão e requer confirmação humana.'},{role:'user',content:body.texto}]})})}finally{clearTimeout(timer)}
   if(!response.ok)return reply({erro:'Falha do provedor',codigo_groq:response.status},502);
   const data=await response.json();
   const suggestion=data?.choices?.[0]?.message?.content;
   if(typeof suggestion!=='string'||!suggestion.trim())return reply({erro:'Resposta vazia do provedor'},502);
   return reply({original:body.texto,sugestao:suggestion,aprovado:false,revisao_humana_obrigatoria:true});
  }catch{return reply({erro:'Falha temporária na revisão'},502)}
 }
};