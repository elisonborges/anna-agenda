// AnnA Agenda — convites institucionais (isolado; NÃO implantado).
// Pré-requisitos de implantação: NEON_AUTH_BASE_URL e AGENDA_NEON_DATABASE_URL
// (segredo do servidor, acesso limitado à branch correta). Nunca expor ao navegador.
import {createRemoteJWKSet,jwtVerify} from "npm:jose@5.10.0";
import postgres from "npm:postgres@3.4.7";
import {validateInvitation} from "./invitation-utils.ts";
const headers={"Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const authBase=Deno.env.get("NEON_AUTH_BASE_URL");
const authUrl=authBase?new URL(authBase):null;
const jwks=authUrl?createRemoteJWKSet(new URL(authBase!.replace(/\/$/,"")+"/.well-known/jwks.json")):null;
async function authenticate(req:Request):Promise<string|null>{
 const authorization=req.headers.get("Authorization")||"";
 if(!authorization.startsWith("Bearer ")||!jwks||!authUrl)return null;
 try{
  const {payload}=await jwtVerify(authorization.slice(7),jwks,{
   issuer:authUrl.origin,audience:authUrl.origin,algorithms:["EdDSA"]
  });
  return typeof payload.sub==="string"&&/^[0-9a-f-]{36}$/i.test(payload.sub)?payload.sub:null;
 }catch{return null;}
}
async function isActiveMaster(userId:string):Promise<boolean>{
 const connection=Deno.env.get("AGENDA_NEON_DATABASE_URL");
 if(!connection)throw Error("Banco de autorização indisponível");
 const sql=postgres(connection,{max:1,connect_timeout:5,idle_timeout:2,ssl:"require"});
 try{
  const rows=await sql`SELECT 1 FROM public.agenda_master_memberships WHERE user_id=${userId}::uuid AND active=TRUE AND revoked_at IS NULL LIMIT 1`;
  return rows.length===1;
 }finally{await sql.end({timeout:2});}
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return reply({error:"Método não permitido"},405);
 const userId=await authenticate(req);
 if(!userId)return reply({error:"Sessão inválida ou expirada"},401);
 let allowed=false;
 try{allowed=await isActiveMaster(userId);}
 catch{return reply({error:"Autorização temporariamente indisponível"},503);}
 if(!allowed)return reply({error:"Acesso exclusivo ao MASTER"},403);
 // MASTER autenticado/autorizado. A emissão permanece bloqueada até
 // implementar criação atômica de convite, auditoria e envio Resend.
 return reply({error:"Emissão de convites ainda não habilitada"},503);
});
