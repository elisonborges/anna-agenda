// AnnA Agenda — consulta de convite (isolado; NÃO implantado).
// Não cria usuários, não ativa vínculos e não devolve dados pessoais.
// Requer implantação com proteção de abuso/rate limiting antes de ser exposto.
import postgres from "npm:postgres@3.4.7";
import {sha256Hex} from "./invitation-utils.ts";
const headers={"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const invalid=()=>reply({valid:false,message:"Convite inválido ou expirado"},200);
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return reply({error:"Método não permitido"},405);
 if((Number(req.headers.get("content-length"))||0)>2048)return reply({error:"Requisição muito grande"},413);
 let token:unknown;
 try{({token}=await req.json());}catch{return reply({error:"Dados inválidos"},400);}
 if(typeof token!=="string"||!/^[0-9a-f]{64}$/.test(token))return invalid();
 const connection=Deno.env.get("AGENDA_NEON_DATABASE_URL");
 if(!connection)return reply({error:"Serviço indisponível"},503);
 const sql=postgres(connection,{max:1,connect_timeout:5,idle_timeout:2,ssl:"require"});
 try{
  const hash=await sha256Hex(token);
  const rows=await sql`SELECT i.id FROM public.agenda_invitations i
   JOIN public.institutions inst ON inst.id=i.institution_id
   WHERE i.token_hash=${hash} AND i.status='pending'
   AND i.expires_at>now() AND inst.active=TRUE LIMIT 1`;
  return rows.length===1?reply({valid:true,message:"Convite pendente de confirmação de identidade"}):invalid();
 }catch{return reply({error:"Serviço indisponível"},503);}
 finally{await sql.end({timeout:2});}
});
