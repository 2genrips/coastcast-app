import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const enc = new TextEncoder();
const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const jsonB64 = (v: unknown) => b64url(enc.encode(JSON.stringify(v)));

function pemToBytes(pem: string) {
  const clean = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g, '');
  return Uint8Array.from(atob(clean), c => c.charCodeAt(0));
}

async function googleAccessToken(serviceAccount: {client_email:string;private_key:string}) {
  const now = Math.floor(Date.now()/1000);
  const head = jsonB64({alg:'RS256',typ:'JWT'});
  const body = jsonB64({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });
  const input = `${head}.${body}`;
  const key = await crypto.subtle.importKey('pkcs8', pemToBytes(serviceAccount.private_key), {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'}, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(input)));
  const assertion = `${input}.${b64url(sig)}`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),
  });
  const tokenBody = await tokenRes.json();
  if(!tokenRes.ok || !tokenBody.access_token) throw new Error(tokenBody.error_description || 'Google OAuth failed');
  return tokenBody.access_token as string;
}

async function sha256Hex(value:string){
  const d=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value)));
  return [...d].map(x=>x.toString(16).padStart(2,'0')).join('');
}

Deno.serve(async (req) => {
  if(req.method === 'OPTIONS') return new Response('ok',{headers:cors});
  try{
    if(req.method !== 'POST') throw new Error('POST required');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const publishableJson = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
    const secretJson = Deno.env.get('SUPABASE_SECRET_KEYS');
    const publishable = publishableJson ? JSON.parse(publishableJson).default : Deno.env.get('SUPABASE_ANON_KEY')!;
    const secret = secretJson ? JSON.parse(secretJson).default : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i,'');
    if(!token) throw new Error('Sign in required');

    const userClient = createClient(supabaseUrl,publishable,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
    const {data:userData,error:userErr}=await userClient.auth.getUser(token);
    if(userErr || !userData.user) throw new Error('Invalid CastVector session');

    const {purchaseToken}=await req.json();
    if(!purchaseToken || typeof purchaseToken!=='string') throw new Error('purchaseToken required');
    const packageName=Deno.env.get('GOOGLE_PLAY_PACKAGE_NAME')!;
    const expectedProduct=Deno.env.get('CASTVECTOR_PREMIUM_PRODUCT_ID') || Deno.env.get('COASTCAST_PREMIUM_PRODUCT_ID') || 'castvector_premium_monthly';
    const sa=JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') || '{}');
    if(!packageName || !sa.client_email || !sa.private_key) throw new Error('Google Play backend secrets are not configured');

    const accessToken=await googleAccessToken(sa);
    const url=`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
    const playRes=await fetch(url,{headers:{Authorization:`Bearer ${accessToken}`}});
    const sub=await playRes.json();
    if(!playRes.ok) throw new Error(sub?.error?.message || 'Google Play verification failed');

    const state=String(sub.subscriptionState||'');
    const entitled=state==='SUBSCRIPTION_STATE_ACTIVE' || state==='SUBSCRIPTION_STATE_IN_GRACE_PERIOD';
    const items=Array.isArray(sub.lineItems)?sub.lineItems:[];
    const matching=items.filter((x:any)=>x.productId===expectedProduct);
    if(!matching.length) throw new Error('Purchase does not match CastVector Premium product');
    const expiry=matching.map((x:any)=>x.expiryTime).filter(Boolean).sort().at(-1) || null;
    if(expiry && new Date(expiry).getTime() <= Date.now()) throw new Error('Subscription has expired');

    const admin=createClient(supabaseUrl,secret,{auth:{persistSession:false}});
    const tokenHash=await sha256Hex(purchaseToken);
    await admin.from('coastcast_play_purchases').upsert({
      token_hash:tokenHash,user_id:userData.user.id,package_name:packageName,product_id:expectedProduct,
      subscription_state:state,latest_expiry:expiry,order_id:sub.latestOrderId||null,
      raw_summary:{acknowledgementState:sub.acknowledgementState,linkedPurchaseToken:!!sub.linkedPurchaseToken},
      verified_at:new Date().toISOString(),updated_at:new Date().toISOString()
    });

    if(entitled){
      const status=state==='SUBSCRIPTION_STATE_IN_GRACE_PERIOD'?'grace':'active';
      const {error}=await admin.from('coastcast_entitlements').upsert({
        user_id:userData.user.id,access_level:'premium',source:'play',status,starts_at:new Date().toISOString(),expires_at:expiry,granted_by:null,note:'Google Play verified',updated_at:new Date().toISOString()
      });
      if(error) throw error;
      await admin.from('coastcast_entitlement_audit').insert({user_id:userData.user.id,action:'play_verify',access_level:'premium',source:'play',expires_at:expiry,note:state});
      if(String(sub.acknowledgementState||'')==='ACKNOWLEDGEMENT_STATE_PENDING'){
        const ackUrl=`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptions/${encodeURIComponent(expectedProduct)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;
        const ackRes=await fetch(ackUrl,{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:'{}'});
        if(!ackRes.ok){
          let ackBody:any={};try{ackBody=await ackRes.json();}catch(_){}
          throw new Error(ackBody?.error?.message || 'Google Play acknowledgement failed');
        }
      }

    } else {
      await admin.from('coastcast_entitlements').update({status:'expired',updated_at:new Date().toISOString(),note:`Google Play: ${state}`}).eq('user_id',userData.user.id).eq('source','play');
    }

    return new Response(JSON.stringify({ok:true,premium:entitled,source:'play',status:state,expires_at:expiry}),{status:200,headers:{...cors,'Content-Type':'application/json'}});
  }catch(err){
    return new Response(JSON.stringify({ok:false,error:err instanceof Error?err.message:String(err)}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
  }
});
