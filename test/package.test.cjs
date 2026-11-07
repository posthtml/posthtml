const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const { pathToFileURL } = require('node:url')

const entry = require.resolve(process.env.POSTHTML_PACKAGE || '..')
const posthtml = require(entry)

test('CommonJS and native ESM expose the processor factory', async () => {
  assert.equal(typeof posthtml, 'function')
  const esm = await import(pathToFileURL(entry).href)
  assert.equal(typeof esm.default, 'function')
  assert.equal((await esm.default().process('<p>Hello</p>')).html, '<p>Hello</p>')
})

test('the synchronous pipeline keeps variadic plugins and tree helpers', () => {
  const result = posthtml()
    .use(tree => tree.match({ tag: 'p' }, node => ({ ...node, tag: 'section' })),
      tree => tree.walk(node => typeof node === 'string' ? node.toUpperCase() : node))
    .process('<p>Hello</p>', { sync: true })

  assert.equal(result.html, '<section>HELLO</section>')
  assert.equal(typeof result.then, 'undefined')
  assert.equal(typeof result.tree.match, 'function')
})

test('Promise and callback plugins run in order', async () => {
  const calls = []
  const result = await posthtml()
    .use(async tree => { calls.push('promise'); return tree })
    .use((tree, done) => { calls.push('callback'); setImmediate(() => done(null, tree)) })
    .use(tree => { calls.push('sync'); return tree })
    .process('<div>ok</div>')

  assert.deepEqual(calls, ['promise', 'callback', 'sync'])
  assert.equal(result.html, '<div>ok</div>')
})

test('async failures reject and async plugins are rejected in sync mode', async () => {
  await assert.rejects(posthtml(() => Promise.reject(new Error('promise failure')))
    .process('<p>test</p>'), /promise failure/)
  await assert.rejects(posthtml((tree, done) => done(new Error('callback failure')))
    .process('<p>test</p>'), /callback failure/)
  assert.throws(() => posthtml((tree, done) => done(null, tree))
    .process('<p>test</p>', { sync: true }), /async plugin/)
})

test('skipParse accepts AST input and preserves boolean attributes', async () => {
  const result = await posthtml().process([
    { tag: 'input', attrs: { disabled: true } }
  ], { skipParse: true })

  assert.equal(result.html, '<input disabled>')
})

test('parser options preserve XML, directives and source locations', async () => {
  const result = await posthtml().process('<?xml version="1.0"?>\n<Root />', {
    xmlMode: true,
    sourceLocations: true,
    directives: [{ name: '?xml', start: '<', end: '>' }],
    singleTags: ['root'],
    closingSingleTag: 'slash'
  })

  assert.equal(result.html, '<?xml version="1.0"?>\n<Root />')
  assert.deepEqual(result.tree[2].location, {
    start: { line: 2, column: 1 },
    end: { line: 2, column: 8 }
  })
})

test('HTML directives and textarea decoding use the published parser', async () => {
  const directive = await posthtml().process('<?php echo 1; ?>', {
    directives: [{ name: '?php', start: '<', end: '>' }]
  })
  const decoded = await posthtml().process('<textarea>&amp;</textarea>', { decodeEntities: true })
  assert.equal(directive.html, '<?php echo 1; ?>')
  assert.equal(decoded.html, '<textarea>&</textarea>')
})

test('messages and original source survive a replacement root', async () => {
  const source = '<p>content</p>'
  const result = await posthtml([
    tree => {
      assert.equal(tree.source, source)
      tree.messages.push({ type: 'dependency', file: 'input.html' })
      return tree
    },
    tree => ({ tag: 'main', content: tree })
  ]).process(source)

  assert.equal(result.html, '<main><p>content</p></main>')
  assert.deepEqual(result.messages, [{ type: 'dependency', file: 'input.html' }])
})

test('HTML rendering stays lazy and reflects later tree changes', async () => {
  const result = await posthtml().process('<p>before</p>')
  assert.equal(result.html, '<p>before</p>')
  result.tree[0].content = ['after']
  assert.equal(result.html, '<p>after</p>')
})

test('custom parser and renderer hooks work in an isolated processor process', () => {
  const script = `
    const assert = require('node:assert/strict');
    const posthtml = require(process.argv[1]);
    (async () => {
      const result = await posthtml().process('payload', {
        parser: input => [{ tag: 'custom', content: [input] }],
        render: tree => 'custom:' + tree[0].content[0]
      });
      assert.equal(result.html, 'custom:payload');
      assert.equal(result.tree[0].tag, 'custom');
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `
  const result = spawnSync(process.execPath, ['-e', script, entry], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr || result.stdout)
})
