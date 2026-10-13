export const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://mt-web3.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cf-turnstile-response',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}
