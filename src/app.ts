import _ from "lodash";
import Card from "./games/knockout/card";
import Knockout from "./games/knockout/knockout";
import TictactoeMove from "./games/tictactoe/move";
import Tictactoe from "./games/tictactoe/tictactoe";
import Node from "./node";

const TOTAL_PLAYERS = 2;
const TOTAL_GAMES = 1;

const playGame = (totalPlayers, agents) => {
  const state = new Tictactoe()
  console.log("PlayersHands", state.moves)

  while (!_.isEmpty(state.getMoves())) {
    let m = Node.ISMCTS(state, agents[state.playerToMove])
    console.log("Player", state.playerToMove, "played move", m)
    state.doMove(m as TictactoeMove)

    /*if(state.isRoundOver) {
      //state.toString()
      //state.nextRound();
    }

    if(state.isTrickOver) {
      console.log('-')
    }*/
  }

  let someoneWon = false
  state.eachPlayer.forEach((playerNum) => {
    if(state.getResult(playerNum) > 0) {
      console.log("Player", playerNum, "wins")//, state.tricksTaken[playerNum], "tricks!")
      someoneWon = true
    }
  })

  if(!someoneWon) {
    console.log("Nobody wins!")
  }

  return {[state.winner]: 1}
}

const agents = {
  "1": 1000,
  "2": 1000,
}

let total = 0;

let results:any = {
  "1": 0,
  "2": 0,
}

let eachRound:any = []

for(var i=0;i<TOTAL_GAMES;i++) {
  eachRound.push(playGame(TOTAL_PLAYERS, agents));
}

eachRound.forEach(r => {
  _.range(1, (TOTAL_PLAYERS+1)).forEach(p => {
    if(r[p]) {
      results[p] += r[p]
      total += r[p]
    }
  })
})

console.log(eachRound)

_.range(1, (TOTAL_PLAYERS+1)).forEach(p => {
  console.log("Player", p, (results[p] / total * 100).toFixed(2) + "%")
})



