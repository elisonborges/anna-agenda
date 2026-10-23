// Persistência preparada para a futura operação de emissão.
// NÃO chamar isoladamente: a entrega por e-mail e a compensação de falhas
// precisam integrar o fluxo antes de liberar o endpoint.
import postgres from "npm:postgres@3.4.7";
import {validateInvitation,newInviteToken,sha256Hex,inviteExpiry} from "./invitation-utils.ts";

export async function prepareInvitation(raw:unknown,masterUserId:string,connection:string){
 const input=validateInvitation(raw);
 const token=newInviteToken();
 const hash=await sha256Hex(token);
 const sql=postgres(connection,{max:1,connect_timeout:5,idle_timeout:2,ssl:"require"});
 try{
  const result=await sql.begin(async tx=>{
   // Serialize invitations for the same institution/email across requests.
   await tx`SELECT pg_advisory_xact_lock(hashtextextended(${input.institution_id+"|"+input.email},0))`;
   // Recheck global MASTER in the same transaction, not only at the HTTP layer.
   const masters=await tx`SELECT 1 FROM public.agenda_master_memberships WHERE user_id=${masterUserId}::uuid AND active=TRUE AND revoked_at IS NULL LIMIT 1`;
   if(masters.length!==1)throw Error("Permissão MASTER ausente");
   const institutions=await tx`SELECT id FROM public.institutions WHERE id=${input.institution_id}::uuid AND active=TRUE FOR SHARE`;
   if(institutions.length!==1)throw Error("Instituição não encontrada ou inativa");
   const existing=await tx`SELECT id FROM public.agenda_invitations WHERE institution_id=${input.institution_id}::uuid AND email=${input.email} AND status='pending' AND expires_at>now() LIMIT 1`;
   if(existing.length)throw Error("Já existe convite pendente para este e-mail");
   const rows=await tx`INSERT INTO public.agenda_invitations
    (institution_id,email,full_name,phone,role,token_hash,status,expires_at,created_by_user_id)
    VALUES (${input.institution_id}::uuid,${input.email},${input.full_name},${input.phone??null},'institution_admin',${hash},'pending',${inviteExpiry()},${masterUserId}::uuid)
    RETURNING id,expires_at`;
   await tx`INSERT INTO public.agenda_invitation_audit (invitation_id,institution_id,actor_user_id,event_type)
    VALUES (${rows[0].id}::uuid,${input.institution_id}::uuid,${masterUserId}::uuid,'created')`;
   return {id:rows[0].id as string,expires_at:rows[0].expires_at as Date};
  });
  // Token bruto nunca é salvo. Somente o serviço de envio deve recebê-lo.
  return {invitation_id:result.id,expires_at:result.expires_at,token,email:input.email};
 }finally{await sql.end({timeout:2});}
}
