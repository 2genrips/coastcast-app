import { createClient } from 'npm:@supabase/supabase-js@2';

const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
const validEmail=(v:string)=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({error:'POST required'},405);
  try{
    const body=await req.json().catch(()=>({}));
    const email=String(body?.email||'').trim().toLowerCase();
    if(!validEmail(email))return json({error:'Enter a valid CastVector account email.'},400);

    const url=Deno.env.get('SUPABASE_URL')!;
    const secretJson=Deno.env.get('SUPABASE_SECRET_KEYS');
    const secret=secretJson?JSON.parse(secretJson).default:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin=createClient(url,secret,{auth:{persistSession:false}});

    // Do not reveal whether an account exists. Avoid duplicate requests within 24 hours.
    const since=new Date(Date.now()-24*60*60*1000).toISOString();
    const {data:recent}=await admin.from('coastcast_deletion_requests').select('id').eq('email',email).gte('requested_at',since).order('requested_at',{ascending:false}).limit(1).maybeSingle();
    if(recent?.id)return json({ok:true,request_id:recent.id});

    const {data,error}=await admin.from('coastcast_deletion_requests').insert({email,status:'requested'}).select('id').single();
    if(error)throw error;
    return json({ok:true,request_id:data.id});
  }catch(err){
    console.error(err);
    return json({error:err instanceof Error?err.message:'Could not submit deletion request'},500);
  }
});
