// Write secrets to .env file so probot can read them, then start up the app

let fs = require('fs')

const secretsDir = '/secrets'
const envFile = '.env'
const ignoredSecretKeys = ['PRIVATE_KEY'] // Use PRIVATE_KEY_PATH to point to secret file, so dont copy this to env

function writeSecretsToEnv () {
  let files = fs.readdirSync(secretsDir)

  files.forEach((filename, _index) => {
    if (!ignoredSecretKeys.includes(filename)) {
      let content = fs.readFileSync(`${secretsDir}/${filename}`, 'utf-8')
      fs.appendFileSync(envFile, `${filename}='${content.trim()}'\n`)
    }
  })
}

function init () {
  console.log('Writing secrets...')
  writeSecretsToEnv()
  console.log('Done.')

  let childProcess = require('child_process')
  childProcess.execSync('npm start', { stdio: [0, 1, 2] })
}

init()
