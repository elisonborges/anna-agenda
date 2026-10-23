import {canActivate} from "./activation-contract.ts";
Deno.test("exige verificação real e e-mail correspondente",()=>{if(canActivate("pending_identity",true,true)||canActivate("identity_verified",false,true)||canActivate("identity_verified",true,false)||!canActivate("identity_verified",true,true))throw Error("Autorização incorreta");});
