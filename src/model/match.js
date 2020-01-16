class Match {
  constructor(key, max_players) {
    this.statusEnum = {
      IN_QUEUE: 0,
      IN_MATCH: 1,
      FINALIZED: 2
    };
    this.players = []; //jogadores ativos
    this.queue = []; // jogadores nas fila de espera
    this.in_match = []; // jogadores em partida
    this.key = key;
    this.max_players = max_players;
    this.status = this.statusEnum.IN_QUEUE;
  }

  getRandomPlayer() {
    const max = this.queue.length - 1;
    const id = Math.floor(Math.random() * max);
    return id;
  }

  initGame() {
    this.status = this.statusEnum.IN_MATCH;
    for (let p of this.players) {
      this.queue.push(p.id);
    }
    while (this.queue.length >= 2) {
      const p1 = this.getRandomPlayer();
      const player_1 = this.players.find((p)=> p.id == this.queue[p1])
      this.queue.splice(p1, 1);
      const p2 = this.getRandomPlayer();
      const player_2 = this.players.find((p)=> p.id == this.queue[p2])
      this.queue.splice(p2, 1);
      this.in_match.push({
        players: [
          {
            player: player_1,
            id: player_1.id,
            type: 1
          },
          {
            player: player_2,
            id: player_2.id,
            type: 2
          }
        ],
        grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        turn: 1
      });
    }
  }

  makeMatch(p1_idx, p2_idx){
    const p1 =  this.players.find((p)=> p.id == this.queue[p1_idx])
    const p2 = this.players.find((p)=> p.id == this.queue[p2_idx])
    const match = {
      players: [
        {
          id:p1.id,
          player: p1,
          type: 1
        },{
          id:p2.id,
          player: p2,
          type: 2
        }
      ],
      grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      turn: 1
    }
    this.in_match.push(match)
    this.queue.splice(p1, 2)
    return match
  }

  addPlayer(player) {
    if (!this.isOpen()) return false;
    this.players.push(player);
    return true;
  }

  isOpen() {
    return (
      this.status == this.statusEnum.IN_QUEUE &&
      this.players.length < this.max_players
    );
  }

  deleteUser(id) {
    this.players = this.players.filter(val => val.id != id);
  }

  countPlayers() {
    return this.players.length;
  }
}

module.exports = Match;
