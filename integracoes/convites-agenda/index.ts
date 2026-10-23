// AnnA Agenda — endpoint de convites, ainda NÃO implantado.
// Etapa atual: validação criptográfica da identidade via Neon Auth.
// Autorização MASTER e persistência são pré-requisitos obrigatórios antes do envio.
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5.10.0";
import { validateInvitation } from "./invitation-utils.ts";
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
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return reply({error:"Método não permitido"},405);
 const userId=await authenticate(req);
 if(!userId)return reply({error:"Sessão inválida ou expirada"},401);
 // A validação do papel MASTER precisa vir de uma fonte server-side confiável,
 // ainda não definida no banco. Não utilizar role do JWT, email ou campo enviado.
 // Falhar fechado, inclusive quando o JWT é válido.
 return reply({error:"Acesso MASTER não configurado para convites"},403);
 // FUTURO: validar MASTER global ativo no Neon, chamar validateInvitation,
 // conferir instituição ativa, registrar hash de token e enviar Resend.
});
