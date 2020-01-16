var express = require('express');
const userController = require('./src/controller/userController')
const matchController = require('./src/controller/matchController')

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

function removePlayer(id, match_key){
  matchController.removePlayer(id, match_key)
  userController.deleteUserMatchKey(id)
}

function verifyWin(winner_id, match_key, io){
  if(matchController.countPlayersInMatch(match_key) == 1){
    io.to(winner_id).emit('end_match')
    matchController.endGame(match_key)
    userController.deleteUserMatchKey(winner_id)
  }else{
    matchController.putPlayerInAwaitQueue(winner_id, match_key)
    io.to(winner_id).emit('win',{})
    matchController.removeMatch(winner_id, match_key)
    notifyWin(match_key, io)
  }
}

function notifyWin(match_id, io){
  const await_queue = matchController.getAwaitQueue(match_id)
  while(await_queue.length >= 2){
    const match = matchController.makeMatch(match_id, 0, 1)
    io.to(match.players[0].id).emit('initMatch', match)
    io.to(match.players[1].id).emit('initMatch', match)
  }
  
  
}

io.on('connection',async (socket)=>{
  const online_users = await userController.addOnlineUser()
  io.emit('getOnlineUsers', online_users)
  
  socket.on('disconnect',async ()=>{
    console.log(`${socket.id} saiu`)
    const matchKey = await userController.getUserMatchKey(socket.id)
    if(matchKey){
      const match = matchController.getMatch(socket.id, matchKey)
      removePlayer(socket.id, matchKey)
      io
        .to(matchKey)
        .emit('countPlayers', matchController.countPlayersInMatch(matchKey))
      
      if(match){
        const w_player = match.players.find((p) => p.id != socket.id)
        verifyWin(w_player.id, matchKey, io)
      }
    }
    const online_users = await userController.removeOnlineUser()
    io.emit('getOnlineUsers', online_users)
  })
  
  socket.on('findMatch', async (name)=>{ 
    if(!name){
      return
    }

    let matchKey = await userController.getUserMatchKey(socket.id)

    if(matchKey){
      io.to(socket.id).emit('findMatch',{
        match_key: matchKey
      })
      return
    }
    matchKey = matchController.getMatchKey()
    matchController.addPlayerToMatch(matchKey, {
      name: name,
      id: socket.id
    })

    await userController.setUserMatchKey(socket.id, matchKey)
    socket.join(matchKey)

    io.to(socket.id).emit('findMatch',{
      match_key: matchKey,
      players: matchController.countPlayersInMatch(matchKey),
      total: matchController.getMaxPlayers()
    })

    io.to(matchKey).emit('countPlayers', matchController.countPlayersInMatch(matchKey))

    if(matchController.canInitGame(matchKey)){
      matchController.initGame(matchKey)
      for(let m of matchController.getInMatchQueue(matchKey)){
        for(let p of m.players){
          io.to(p.id).emit('initMatch', m)
        }
      }
    }
  })

  /**
   * TODO:
   *       FLUXO DE VITORIA
   *      MELHORAR FILA DE ESPERA
   */
  socket.on('put_in_board',async (val)=>{
    const match_id = await userController.getUserMatchKey(socket.id)
    const match = matchController.getMatch(socket.id, match_id)
    const me = matchController.getPlayerById(socket.id, match.players)
    if(me.type !== match.turn){
      return
    }
    if(match.grid[val.x][val.y] == 0){
      match.grid[val.x][val.y] = me.type
      match.turn = me.type==1?2:1
      for(let p of match.players){
        io.to(p.id).emit('turn',match)
      }
    }
    setTimeout(()=>{
      winner = matchController.verifyWinner(match.grid)
      let w_player
      if(winner > 0){
        for(let p of match.players){
          if(p.type === winner){
            w_player = p
          }else{
            io.to(p.id).emit('lose', matchController.countPlayersInMatch(match_id))
            removePlayer(p.id, match_id)
          }
        }

        verifyWin(w_player.id,match_id, io)
      
      }else if(matchController.verifyDraw(match.grid)){
        for(let p of match.players){
          io.to(p.id).emit('lose', matchController.countPlayersInMatch(match_id))
          matchController.removePlayer(p.id, match_id)
        }
        matchController.removeMatch(socket.id, match_id)
      }
    },500)
  })

  socket.on('countdown_end', async ()=>{
    const match_key = await userController.getUserMatchKey(socket.id)
    if(!match_key) return
    const match = matchController.getMatch(socket.id, match_key)
    if(!match) return
    const winner = match.players.find((player) => player.id != socket.id)
    
    io.to(socket.id).emit('lose', matchController.countPlayersInMatch(match_key))
    
    removePlayer(socket.id, match_key)
    verifyWin(winner.id, match_key, io)
  }) 
});

module.exports = {app, server};
