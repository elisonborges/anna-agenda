// Contrato de API planejado; não constitui prova de e-mail verificado.
export type InviteLookup={valid:boolean;message:string};
export type ActivationState="invalid"|"pending_identity"|"identity_verified"|"accepted"|"revoked"|"expired";
export function canActivate(state:ActivationState,authEmailVerified:boolean,emailMatches:boolean):boolean{
 return state==="identity_verified"&&authEmailVerified&&emailMatches;
}
