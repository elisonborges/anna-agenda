import {validTokenFormat,expired,allowedTransition,safeInviteResult} from "./invitation-policy.ts";
Deno.test("token deve ter 64 hexadecimais minúsculos",()=>{if(!validTokenFormat("a".repeat(64))||validTokenFormat("A".repeat(64))||validTokenFormat("a".repeat(63)))throw Error("Formato incorreto");});
Deno.test("prazo exato é expirado",()=>{const now=new Date("2026-10-23T12:00:00Z");if(!expired(now,now)||expired(new Date(now.getTime()+1),now))throw Error("Prazo incorreto");});
Deno.test("convite não pode ser reutilizado",()=>{if(!allowedTransition("pending","accepted")||allowedTransition("accepted","accepted")||allowedTransition("revoked","accepted"))throw Error("Transição incorreta");});
Deno.test("resultado público não contém e-mail",()=>{if(JSON.stringify(safeInviteResult(false)).includes("@"))throw Error("Vazamento");});
