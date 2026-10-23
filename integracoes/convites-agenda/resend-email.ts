// AnnA Agenda — transporte Resend isolado; NÃO implantado nem chamado pelo endpoint.
// Usar somente após autorização MASTER, persistência e fluxo de ativação validados.
const sender="AnnA One | Agenda Educacional <agenda@annaone.com.br>"; // Exige domínio/remetente verificado no Resend.
const activationOrigin="https://elisonborges.github.io";
const activationPath="/anna-agenda/ativar-acesso.html";
function escapeHtml(s:string):string{
 return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
export function activationUrl(token:string):string{
 if(!/^[0-9a-f]{64}$/.test(token))throw Error("Token inválido");
 const url=new URL(activationPath,activationOrigin);
 url.searchParams.set("convite",token);
 return url.toString();
}
export async function sendInvitationEmail(input:{email:string;full_name:string;institution_name:string;token:string}):Promise<string>{
 const key=Deno.env.get("RESEND_API_KEY");
 if(!key)throw Error("Resend não configurado");
 const htmlTemplate=await Deno.readTextFile(new URL("./email-convite.html",import.meta.url));
 const html=htmlTemplate
  .replaceAll("{{NOME_DESTINATARIO}}",escapeHtml(input.full_name))
  .replaceAll("{{NOME_INSTITUICAO}}",escapeHtml(input.institution_name))
  .replaceAll("{{URL_CONVITE_VALIDADA}}",escapeHtml(activationUrl(input.token)));
 const response=await fetch("https://api.resend.com/emails",{
  method:"POST",
  headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
  body:JSON.stringify({from:sender,to:[input.email],subject:"Ative seu acesso à AnnA Agenda Educacional",html})
 });
 if(!response.ok)throw Error(`Falha no envio Resend (HTTP ${response.status})`);
 const result=await response.json();
 if(typeof result.id!=="string")throw Error("Resposta de envio sem identificador");
 return result.id;
}
