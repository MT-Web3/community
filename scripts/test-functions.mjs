import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { webcrypto } from 'node:crypto'
import { transformWithEsbuild } from 'vite'

const shared = (await Promise.all(['cors', 'validation'].map(name => readFile(`supabase/functions/_shared/${name}.ts`, 'utf8')))).join('\n').replace(/^export /gm, '')
async function handler(name, options = {}) {
  const recorded = { inserts: [], filters: [] }
  const client = {
    rpc: async () => ({ data: options.allowed ?? true, error: options.rateError ?? null }),
    from(table) {
      const query = {
        select() { return query }, order() { return query }, limit() { return query },
        neq(...args) { recorded.filters.push(args); return query },
        eq(...args) { recorded.filters.push(args); return query },
        async single() { return { data: { id: 'campaign', status: options.status || 'active', starts_at: null, ends_at: null, form_config: { walletRequired: options.walletRequired || false } }, error: null } },
        async insert(row) { recorded.inserts.push(row); return { error: null } },
        then(resolve) { return Promise.resolve({ data: options.rows || [], error: null }).then(resolve) },
      }
      assert.ok(['campaigns', 'applications'].includes(table))
      return query
    },
  }
  const source = (await readFile(`supabase/functions/${name}/index.ts`, 'utf8')).replace(/^import .*\r?\n/gm, '')
  const { code } = await transformWithEsbuild(`${shared}\n${source}`, `${name}.ts`, { loader: 'ts', target: 'es2022' })
  let serve
  new Function('createClient', 'Deno', 'crypto', code)(() => client, {
    env: { get: name => ({ HASH_SECRET: 'local-test-only', SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only' })[name] },
    serve: callback => { serve = callback },
  }, webcrypto)
  return { recorded, async invoke(body) {
    const response = await serve(new Request('https://test/functions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }))
    return { status: response.status, body: await response.json() }
  } }
}
const valid = { campaignId:'campaign',xUsername:'@DaoMinTam',postUrl1:'x.com/daomintam/status/2108877056608219217',postUrl2:'twitter.com/daomintam/status/2108877056608219218?s=20',consent:true }
const submit = await handler('submit-application')
const receipt = await submit.invoke(valid)
assert.equal(receipt.status,201)
assert.match(receipt.body.id,/^[0-9a-f-]{36}$/)
assert.equal(submit.recorded.inserts[0].x_profile_url,'https://x.com/daomintam')
assert.equal(submit.recorded.inserts[0].post_url_1,'https://x.com/daomintam/status/2108877056608219217')
assert.equal((await submit.invoke({...valid,postUrl2:'https://twitter.com/other/status/2108877056608219217'})).status,400)
assert.equal((await (await handler('submit-application',{walletRequired:true})).invoke(valid)).status,400)
assert.equal((await (await handler('submit-application',{status:'ended'})).invoke(valid)).status,409)
assert.equal((await (await handler('submit-application',{allowed:false})).invoke(valid)).status,429)
assert.equal((await (await handler('submit-application',{rateError:{message:'database unavailable'}})).invoke(valid)).status,503)
const lookup = await handler('application-status',{rows:[{id:'application-id',status:'pending',updated_at:'2026-10-14',campaigns:{name:'Campaign'},wallet_address:'private',post_url_1:'private',review_note:'private'}]})
const results = await lookup.invoke({handle:'@DaoMinTam'})
assert.equal(results.status,200)
assert.deepEqual(results.body,{applications:[{id:'application-id',status:'pending',campaign:'Campaign',updatedAt:'2026-10-14'}]})
assert.ok(lookup.recorded.filters.some(([column,value]) => column === 'x_username_normalized' && value === 'daomintam'))
assert.ok(lookup.recorded.filters.some(([column,value]) => column === 'campaigns.status' && value === 'draft'))
assert.equal((await lookup.invoke({handle:'invalid handle'})).status,400)
assert.equal((await lookup.invoke({code:'MT-ABCDEF12'})).body.id,'application-id')
assert.equal((await (await handler('application-status',{allowed:false})).invoke({handle:'daomintam'})).status,429)
const translated = await handler('application-status',{rows:[{id:'application-id',status:'pending',updated_at:'2026-10-14',campaigns:{name:'Bản gốc',form_config:{translations:{en:{name:'English campaign'}}}}}]})
assert.equal((await translated.invoke({handle:'daomintam',language:'en'})).body.applications[0].campaign,'English campaign')
console.log('Edge Function checks passed: receipts, URL normalization, duplicate posts, wallet, lifecycle, rate limits, privacy and legacy codes.')
