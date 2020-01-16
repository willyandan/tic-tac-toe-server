const redis = require('redis')
const client = redis.createClient({
  host:'server_redis_1'
})

client.on('error', (err)=>{
  console.log(err.stack)
})

/**
 * 
 * @param {string} key 
 * @param {string} value 
 */
const set = async (key, value)=>{
  await client.set(key,value,redis.print)
}

const get = (key) => {
  return new Promise((resolve)=>{
    client.get(key,function(err, val){
      resolve(val)
    })
  })
}

const del = async (key) => {
  await client.del(key)
}

module.exports = {
  get,
  set,
  del
}