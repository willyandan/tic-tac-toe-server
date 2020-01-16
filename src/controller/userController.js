const redisController = require('./redisController')
redisController.set('online_users', '0')

const userMatch = {}


const getOnlineUsers = async () =>{
  return (await redisController.get('online_users')) | 0
}

const addOnlineUser = async () => {
  let online_users = (await redisController.get('online_users')) | 0 
  online_users = parseInt(online_users)
  online_users++
  await redisController.set('online_users',online_users)
  return online_users
}

const removeOnlineUser = async () => {
  let online_users = (await redisController.get('online_users')) | 0 
  online_users = parseInt(online_users)
  online_users--
  redisController.set('online_users',online_users)
  return online_users
}

const setUserMatchKey = async (user_id, key) => {
  await redisController.set(`${user_id}`, key)
}

const getUserMatchKey = async (user_id) => {
  const key = await redisController.get(`${user_id}`)
  return key
}

const deleteUserMatchKey = async (user_id) => {
  await redisController.del(user_id)
}

module.exports = {
  getOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setUserMatchKey,
  getUserMatchKey,
  deleteUserMatchKey
}