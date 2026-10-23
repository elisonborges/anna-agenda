import {requestOriginAllowed,readSmallJson} from "./http-security.ts";
Deno.test("rejeita origem diferente",()=>{const r=new Request("https://example.org",{headers:{origin:"https://evil.invalid"}});if(requestOriginAllowed(r,"https://example.org"))throw Error("Origem aceita");});
Deno.test("aceita origem exata",()=>{const r=new Request("https://example.org",{headers:{origin:"https://example.org"}});if(!requestOriginAllowed(r,"https://example.org"))throw Error("Origem rejeitada");});
Deno.test("limita corpo sem confiar no content-length",async()=>{const r=new Request("https://example.org",{method:"POST",body:JSON.stringify({a:"x".repeat(100)})});let blocked=false;try{await readSmallJson(r,20)}catch{blocked=true}if(!blocked)throw Error("Limite falhou");});
