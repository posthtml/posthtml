const chalk = require('chalk')

const frame = (err) => {
  err.message = err.name === 'PluginError'
    ? `❌  ${err.name}: ${err.plugin}\n\n`
    : `⚠️  ${err.name}: ${err.plugin}\n\n`

  err.message += `[${err.location.line}:${err.location.column}] ${
      err.message.length > 80
        ? `${err.message.substr(0, 70)}\n${
          err.message.substr(70, err.message.length)
        }`
        : err.message
    }\n\n`

  let _ = ''
  while (_.length < 80) _ += ' '

  err.message += chalk.underline(
    `${err.file}${_.substr(err.file.length, 80)}\n\n`
  )

  const frames = err.src.split('\n')

  const format = (src, line) => src.slice(Math.max(0, line - 3), line + 2)

  format(frames, err.location.line).forEach((frame, i) => {
    const line = err.location.line + i - 2

    let offset = ''
    const cursor = err.location.column

    while (offset.length < cursor + 5) offset += ' '

    err.message += line === err.location.line
      ? chalk.inverse(`\n > ${err.location.line}| ${frame} \n`) + `${offset}🔺\n`
      : chalk.white(`${err.location.line}| ${frame}\n`)
  })

  err.message += chalk.underline(`${_}\n`)

  return err.name === 'PluginError'
    ? chalk.bold.red(`${err.message}\n`)
    : chalk.bold.yellow(`${err.message}\n`)
}

module.exports = frame
