import { readFile, mkdir, writeFile } from 'node:fs/promises'

// The dashboard editor starts with index.ts; bundle our small local shared modules for it.
const shared = await Promise.all(['cors', 'validation'].map(async name => (await readFile(`supabase/functions/_shared/${name}.ts`, 'utf8')).replace(/^export /gm, '')))
await mkdir('.supabase-bundles', { recursive: true })
for (const name of ['application-status', 'submit-application']) {
  const source = (await readFile(`supabase/functions/${name}/index.ts`, 'utf8')).replace(/^import .*from '\.\.\/_shared\/[^']+'\r?\n/gm, '')
  await writeFile(`.supabase-bundles/${name}.ts`, `${shared.join('\n')}\n${source}`)
  console.log(`Bundled ${name}`)
}
