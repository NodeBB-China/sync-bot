'use strict'
const child = require('child_process')
const util = require('util')
const path = require('path')
const CronJob = require('cron').CronJob
const pify = util.promisify
const exec = pify(child.exec)

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

  data = await execCMD('git checkout v1.8.x')
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
// sync()
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
