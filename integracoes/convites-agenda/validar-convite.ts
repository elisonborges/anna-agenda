// Consulta isolada; NÃO implantada. Requer rate limiting distribuído antes de expor.
import postgres from "npm:postgres@3.4.7";
import {sha256Hex} from "./invitation-utils.ts";
import {validTokenFormat,safeInviteResult} from "./invitation-policy.ts";
import {json,readSmallJson,requestOriginAllowed} from "./http-security.ts";
const allowedOrigin="https://elisonborges.github.io";
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return json({error:"Método não permitido"},405);
 if(!requestOriginAllowed(req,allowedOrigin))return json({error:"Origem não permitida"},403);
 if(!(req.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))return json({error:"Tipo inválido"},415);
 let raw:unknown;
 try{raw=await readSmallJson(req);}catch{return json({error:"Dados inválidos ou excessivos"},400);}
 const token=(raw&&typeof raw==="object"&&!Array.isArray(raw))?(raw as Record<string,unknown>).token:undefined;
 if(!validTokenFormat(token))return json(safeInviteResult(false));
 const connection=Deno.env.get("AGENDA_NEON_DATABASE_URL");
 if(!connection)return json({error:"Serviço indisponível"},503);
 const sql=postgres(connection,{max:1,connect_timeout:5,idle_timeout:2,ssl:"require"});
 try{
  const hash=await sha256Hex(token);
  const rows=await sql`SELECT i.id FROM public.agenda_invitations i
   JOIN public.institutions inst ON inst.id=i.institution_id
   WHERE i.token_hash=${hash} AND i.status='pending'
   AND i.expires_at>now() AND inst.active=TRUE LIMIT 1`;
  return json(safeInviteResult(rows.length===1));
 }catch{return json({error:"Serviço indisponível"},503);}
 finally{await sql.end({timeout:2});}
});
