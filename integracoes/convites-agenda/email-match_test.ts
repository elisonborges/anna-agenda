import { emailMatches } from "./email-match.ts";
Deno.test("e-mail verificado deve corresponder ao convite",()=>{
 if(!emailMatches("A@EXAMPLE.COM","a@example.com",true)) throw Error("Correspondência válida rejeitada");
 if(emailMatches("a@example.com","b@example.com",true)) throw Error("E-mail divergente aceito");
 if(emailMatches("a@example.com","a@example.com",false)) throw Error("E-mail não verificado aceito");
});
