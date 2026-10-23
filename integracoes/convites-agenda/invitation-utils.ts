// Helpers puros do fluxo de convites AnnA Agenda.
// Sem dependências de produção; executável com Deno test.
export type InvitationInput={institution_id:string;email:string;full_name:string;phone?:string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validateInvitation(value:unknown):InvitationInput{
 if(!value||typeof value!=="object"||Array.isArray(value))throw Error("Dados inválidos");
 const v=value as Record<string,unknown>;
 if(typeof v.institution_id!=="string"||!uuid.test(v.institution_id))throw Error("Instituição inválida");
 if(typeof v.email!=="string")throw Error("E-mail inválido");
 const email=v.email.trim().toLowerCase();
 if(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error("E-mail inválido");
 if(typeof v.full_name!=="string"||v.full_name.trim().length<3||v.full_name.trim().length>160)throw Error("Nome inválido");
 if(v.phone!==undefined&&(typeof v.phone!=="string"||v.phone.length>32))throw Error("Telefone inválido");
 return {institution_id:v.institution_id,email,full_name:v.full_name.trim(),...(typeof v.phone==="string"?{phone:v.phone.trim()}:{})};
}
export function newInviteToken():string{
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 return Array.from(bytes,x=>x.toString(16).padStart(2,"0")).join("");
}
export async function sha256Hex(value:string):Promise<string>{
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
 return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,"0")).join("");
}
export function inviteExpiry(now=new Date()):string{return new Date(now.getTime()+24*60*60*1000).toISOString()}
