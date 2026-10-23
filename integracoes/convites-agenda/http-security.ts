export const jsonHeaders={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Pragma":"no-cache","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"};
export function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:jsonHeaders});}
export function requestOriginAllowed(req:Request,allowed:string):boolean{
 const origin=req.headers.get("origin");
 return !!origin&&origin===allowed;
}
export async function readSmallJson(req:Request,max=2048):Promise<unknown>{
 const reader=req.body?.getReader();if(!reader)throw Error("Corpo ausente");
 let length=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max)throw Error("Corpo excessivo");chunks.push(value);}}
 finally{reader.releaseLock();}
 const buffer=new Uint8Array(length);let offset=0;for(const c of chunks){buffer.set(c,offset);offset+=c.length;}
 return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(buffer));
}
