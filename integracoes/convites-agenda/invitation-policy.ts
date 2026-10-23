export const TOKEN_RE=/^[0-9a-f]{64}$/;
export const INVITATION_TTL_HOURS=24;
export function validTokenFormat(token:unknown):token is string{return typeof token==="string"&&TOKEN_RE.test(token);}
export function expired(expiresAt:Date,now=new Date()):boolean{return expiresAt.getTime()<=now.getTime();}
export function allowedTransition(from:string,to:string):boolean{return from==="pending"&&(to==="accepted"||to==="revoked");}
export function safeInviteResult(found:boolean){return found?{valid:true,message:"Convite pendente de confirmação de identidade"}:{valid:false,message:"Convite inválido ou expirado"};}
