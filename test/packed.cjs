const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { parseArgs } = require('node:util')

const repo = path.resolve(__dirname, '..')
const { values, positionals } = parseArgs({
  options: { parser: { type: 'string' }, render: { type: 'string' } },
  allowPositionals: true
})
assert.equal(positionals.length, 1, 'Usage: npm run test:packed -- <posthtml.tgz> [--parser <parser.tgz>] [--render <render.tgz>]')
assert.ok(process.env.npm_execpath, 'Run this helper through npm run test:packed')

const work = fs.mkdtempSync(path.join(process.env.POSTHTML_TEST_TMP || process.env.RUNNER_TEMP || os.tmpdir(), 'posthtml-packed-'))
const consumer = path.join(work, 'consumer')
const harness = path.join(work, 'harness')
const dependencies = { posthtml: tarball(positionals[0]) }
const overrides = {}
for (const [option, name] of [['parser', 'posthtml-parser'], ['render', 'posthtml-render']]) {
  if (values[option]) {
    dependencies[name] = tarball(values[option])
    overrides[name] = '$' + name
  }
}

writePackage(consumer, {
  private: true,
  dependencies,
  ...(Object.keys(overrides).length ? { overrides: { posthtml: overrides } } : {})
})
const lock = JSON.parse(fs.readFileSync(path.join(repo, 'package-lock.json'), 'utf8'))
writePackage(harness, {
  private: true,
  dependencies: Object.fromEntries(['mocha', 'chai', 'chai-as-promised'].map(name => [
    name, lock.packages['node_modules/' + name].version
  ]))
})

let passed = false
try {
  install(consumer)
  install(harness)
  const installed = path.join(consumer, 'node_modules/posthtml')
  assert.equal(fs.existsSync(path.join(consumer, 'node_modules/mocha')), false)
  assert.equal(fs.existsSync(path.join(consumer, 'node_modules/typescript')), false)
  fs.cpSync(path.join(repo, 'test'), path.join(installed, 'test'), { recursive: true })
  fs.copyFileSync(path.join(repo, '.mocharc.json'), path.join(installed, '.mocharc.json'))

  const mochaPackage = path.join(harness, 'node_modules/mocha')
  const mocha = JSON.parse(fs.readFileSync(path.join(mochaPackage, 'package.json'), 'utf8'))
  const mochaBin = typeof mocha.bin === 'string' ? mocha.bin : mocha.bin.mocha
  const env = {
    ...process.env,
    NODE_PATH: path.join(harness, 'node_modules'),
    POSTHTML_PACKAGE: installed
  }
  run([path.join(mochaPackage, mochaBin)], { cwd: installed, env })
  run(['--test', path.join(installed, 'test/package.test.cjs')], { cwd: installed, env })
  passed = true
  console.log('Packed PostHTML passed the full suite and consumer checks on ' + process.version)
} finally {
  if (passed) fs.rmSync(work, { recursive: true, force: true })
  else console.error('Failed consumer fixture preserved at ' + work)
}

function tarball (file) {
  const resolved = path.resolve(file)
  assert.ok(fs.statSync(resolved).isFile(), 'Expected a packed npm tarball: ' + resolved)
  return 'file:' + resolved
}

function writePackage (directory, manifest) {
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify(manifest, null, 2))
}

function install (prefix) {
  run([process.env.npm_execpath, 'install', '--prefix', prefix, '--ignore-scripts', '--omit=dev'], { cwd: repo })
}

function run (args, options) {
  const result = spawnSync(process.execPath, args, { ...options, stdio: 'inherit' })
  if (result.error) throw result.error
  assert.equal(result.status, 0, 'Command failed: ' + args.join(' '))
}
