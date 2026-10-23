import {assertEquals,assertThrows} from "jsr:@std/assert@1";
import {validateInvitation,newInviteToken,sha256Hex,inviteExpiry} from "./invitation-utils.ts";
const valid={institution_id:"11111111-1111-4111-8111-111111111111",email:" Admin@Example.com ",full_name:" Admin Teste "};
Deno.test("normaliza email e nome",()=>{const x=validateInvitation(valid);assertEquals(x.email,"admin@example.com");assertEquals(x.full_name,"Admin Teste")});
Deno.test("recusa instituição inválida",()=>assertThrows(()=>validateInvitation({...valid,institution_id:"abc"})));
Deno.test("recusa email inválido",()=>assertThrows(()=>validateInvitation({...valid,email:"sem-arroba"})));
Deno.test("token aleatório de 256 bits",()=>{const a=newInviteToken(),b=newInviteToken();assertEquals(a.length,64);assertEquals(a!==b,true)});
Deno.test("hash determinístico sem token puro",async()=>{const token=newInviteToken(),hash=await sha256Hex(token);assertEquals(hash.length,64);assertEquals(hash!==token,true)});
Deno.test("expiração em 24 horas",()=>assertEquals(inviteExpiry(new Date("2026-10-23T10:00:00Z")),"2026-10-24T10:00:00.000Z"));
