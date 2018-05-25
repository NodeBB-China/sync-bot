'use strict'
// Import Packages
const child = require('child_process')
const util = require('util')
const path = require('path')
const fetch = require('node-fetch')
const CronJob = require('cron').CronJob
const pify = util.promisify

// Init
const exec = pify(child.exec)

// Static Vars
const github_api = 'https://api.github.com'
const nodebb_tags = '/repos/NodeBB/NodeBB/tags'

// fetch latest Target Branch
async function fetchBranch() {
  const tagsDataResponse = await fetch(`${github_api}${nodebb_tags}`)
  const tagsData = await tagsDataResponse.json()
  // console.log(tagsData)
  const currentVersion = Array.isArray(tagsData) ? tagsData[0].name : null
  if (!currentVersion) {
    throw new Error('Can\'t fetch latest NodeBB Branch. ')
  }
  const Branch = currentVersion.slice(0, currentVersion.length - 2) + '.x'
  return Branch
}

// Sync Repos
async function syncDocs() {
  // cd target dir
  let data = await exec('git checkout master', {
    cwd: path.join(__dirname, './nodebb-cn-docs')
  })
  console.log(data)
  data = await exec('git fetch target', {
    cwd: path.join(__dirname, './nodebb-cn-docs')
  })
  console.log(data)
    data = await exec('git reset --hard target/master', {
    cwd: path.join(__dirname, './nodebb-cn-docs')
  })
  console.log(data)
  data = await exec('git push origin', {
    cwd: path.join(__dirname, './nodebb-cn-docs')
  })
  console.log(data)
}

async function syncNodeBB() {
  // Init WorkSpace
  const execCMD = async (CMD) => {
    return exec(CMD, {
      cwd: path.join(__dirname, './NodeBB')
    }) 
  }
  let data = await execCMD('git checkout master')
  console.log(data)
  data = await execCMD('git pull')
  console.log(data)
  data = await execCMD('git push target')
  console.log(data)

  data = await execCMD('git checkout develop')
  console.log(data)
  data = await execCMD('git pull')
  console.log(data)
  data = await execCMD('git push target')
  console.log(data)

  const branch = await fetchBranch()
  data = await execCMD(`git checkout ${branch}`)
  console.log(data)
  data = await execCMD('git pull')
  console.log(data)
  data = await execCMD('git push target')
  console.log(data)
}

async function sync() {
 try {
    const ts = Date.now()
    await Promise.all([syncDocs(), syncNodeBB()])
    console.log(`耗时: ${(Date.now() - ts)/1000 } s `)
  } catch (err) {
    console.log(err)
  }     
}
// for run test
sync()
// Register CronJob
const job = new CronJob({
  cronTime: '1 */3 * * * *',
  onTick: sync,
  onComplete: () => {
    console.log('CronJob Exit. Process exit')
    process.exit(1)
  },
  start: false,
  timeZone: 'Asia/Shanghai'
})
job.start()

