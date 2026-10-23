import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('./anna-revisora-jwt-bridge.worker.js',import.meta.url),'utf8');
const moduleUrl='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const worker=(await import(moduleUrl)).default;
const origin='https://profelisonborges.github.io';
const env={ALLOWED_ORIGIN:origin,GROQ_API_KEY:'fake-test-key',NEON_REST_URL:'https://neon.test/rest/v1',REVIEW_RATE_LIMITER:{limit:async()=>({success:true})}};
const nativeFetch=globalThis.fetch;
let groqCalls=0,neonCalls=0,neonResult=[{user_id:'00000000-0000-4000-8000-000000000001',institution_id:'11111111-1111-4111-8111-111111111111'}];
globalThis.fetch=async url=>{if(String(url).includes('neon.test')){neonCalls++;return new Response(JSON.stringify(neonResult),{status:200})}groqCalls++;return new Response(JSON.stringify({choices:[{message:{content:'Os alunos deverão fazer as atividades amanhã.'}}]}),{status:200})};
const request=(token='valid.jwt.token',reqOrigin=origin,body={texto:'Os aluno devera fazer as atividade amanhã.'})=>new Request('https://worker.test/',{method:'POST',headers:{Origin:reqOrigin,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
try{
 let response=await worker.fetch(request('valid.jwt.token','https://evil.example'),env);assert.equal(response.status,403);assert.equal(neonCalls,0);
 response=await worker.fetch(request(''),env);assert.equal(response.status,401);assert.equal(neonCalls,0);
 neonResult=[];response=await worker.fetch(request(),env);assert.equal(response.status,403);assert.equal(groqCalls,0);
 neonResult=[{user_id:'00000000-0000-4000-8000-000000000001'}];response=await worker.fetch(request(),env);assert.equal(response.status,200);const result=await response.json();assert.equal(result.revisao_humana_obrigatoria,true);assert.equal(result.aprovado,false);
 response=await worker.fetch(request('valid.jwt.token',origin,{texto:'x'.repeat(6001)}),env);assert.equal(response.status,400);
 response=await worker.fetch(request(),{...env,REVIEW_RATE_LIMITER:{limit:async()=>({success:false})}});assert.equal(response.status,429);
 console.log('6 cenários simulados passaram. Nenhuma chamada real ao Neon ou à Groq.');
}finally{globalThis.fetch=nativeFetch}
