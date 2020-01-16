const Match = require('../model/match')
const matches = {}
const MAX_PLAYERS = 2

const generateId = ()=>{
  return Math.random().toString(36).substr(2, 9);
}

const getMatchKey = ()=>{
  let matchKey
  for(let key in matches){
    const value = matches[key]
    if(value.isOpen()){
      if( (!matchKey) || (matchKey && value.players < matches[matchKey].players) ){
        matchKey = key
      }
    }
  }
                                                                  
  if(!matchKey){                                                     
    matchKey = generateId()            
    matches[matchKey] = new Match(matchKey, MAX_PLAYERS)
  }                                                                  
  return matchKey
}

const getMatch = (player_id, match_id)=>{
  for(let m of matches[match_id].in_match){
    for(let p of m.players){
      if(p.id ==player_id) return m
    }
  }
  return undefined
}

const getPlayerById = (id, players)=>{
  for(p of players){
    if(p.id == id) return p
  }
  return undefined
}


// COISAS DO TTT
const verifyWinner = (grid)=>{
  for(let i=0; i<3; ++i){
    if(grid[i][0] == 1 && grid[i][1] == 1 && grid[i][2] == 1){
      return 1
    }else if(grid[i][0] == 2 && grid[i][1] == 2 && grid[i][2] == 2){
      return 2
    }
    
    if(grid[0][i] == 1 && grid[1][i] == 1 && grid[2][i] == 1){
      return 1
    }else if(grid[i][0] == 2 && grid[i][1] == 2 && grid[i][2] == 2){
      return 2
    }
  }  
  if(grid[0][0] == 1 && grid[1][1] == 1 && grid[2][2] == 1){
    return 1
  }else if(grid[0][0] == 2 && grid[1][1] == 2 && grid[2][2] == 2){
    return 2
  }

  if(grid[0][2] == 1 && grid[1][1] == 1 && grid[2][0] == 1){
    return 1
  }else if(grid[0][2] == 2 && grid[1][1] == 2 && grid[2][0] == 2){
    return 2
  }
  return 0
}

const verifyDraw = (grid) => {
  for(let i=0; i< 3; ++i){
    for(let j=0; j< 3; ++j){
      if(grid[i][j] == 0) return false
    }
  }
  return true
}

// FIM DAS COISAS DO TTT


const removeMatch = (id, match_id)=>{
  const match = matches[match_id]
  for(let idx in match.in_match){
    const m = match.in_match[idx]
    for(let p of m.players){
      if(p.id == id){
        match.in_match = match.in_match.filter((val,i)=>i!=idx)
        return
      }
    }
  }
  return undefined
}

const endGame = (match_id) => {
  delete matches[match_id]
}

const removePlayer = (user_id, match_key) =>{
  if(!user_id || !match_key) return
  if(!matches[match_key]) return
  matches[match_key].deleteUser(user_id)
}

const countPlayersInMatch = (match_key) => {
  return matches[match_key].countPlayers()
}

const addPlayerToMatch = (match_key, player)=>{
  matches[match_key].addPlayer(player)
}

const initGame = (match_key) => {
  matches[match_key].initGame()
}

const canInitGame = (match_key) => {
  return countPlayersInMatch(match_key) >= matches[match_key].max_players
}

const getInMatchQueue = (match_key) => {
  return matches[match_key].in_match || []
}

const getMaxPlayers = () => {
  return MAX_PLAYERS
}

const putPlayerInAwaitQueue = (id, match_id) => {
  matches[match_id].queue.push(id)
}

const getAwaitQueue = (match_id) => matches[match_id].queue

const makeMatch = (match_id, p1_idx, p2_idx) => {
  return matches[match_id].makeMatch(p1_idx, p2_idx)
}

module.exports = {
  getMatchKey,
  getMatch,
  getPlayerById,
  verifyWinner,
  verifyDraw,
  removePlayer,
  removeMatch,
  countPlayersInMatch,
  addPlayerToMatch,
  initGame,
  canInitGame,
  getInMatchQueue,
  getMaxPlayers,
  putPlayerInAwaitQueue,
  endGame,
  getAwaitQueue,
  makeMatch
}