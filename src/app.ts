import _ from "lodash";
import Card from "./games/knockout/card";
import GameState from "./games/knockout/knockout";
import Node from "./node";

const runTotalGames = 10;

const playGame = (totalPlayers, agents) => {
  const state = new GameState(totalPlayers)
  console.log("PlayersHands", state.playerHands)

  while (!_.isEmpty(state.getMoves())) {
    let m = Node.ISMCTS(state, agents[state.playerToMove])
    console.log("Player", state.playerToMove, "played move", m)
    state.doMove(m as Card)

    if(state.isRoundOver) {
      //state.toString()
      //state.nextRound();
    }

    if(state.isTrickOver) {
      console.log('-')
    }
  }

  let someoneWon = false
  state.eachPlayer.forEach((playerNum) => {
    if(state.getResult(playerNum) > 0) {

      console.log("Player", playerNum, "wins with", state.tricksTaken[playerNum], "tricks!")
      someoneWon = true
    }
  })

  if(!someoneWon) {
    console.log("Nobody wins!")
  }

  return state.tricksTaken
}

const agents = {
  "1": 1000,
  "2": 100,
  "3": 100,
  "4": 100,
}

let total = 0;

let results:any = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0
}

let eachRound:any = []

for(var i=0;i<runTotalGames;i++) {
  eachRound.push(playGame(4, agents));
}

eachRound.forEach(r => {
  _.range(1, 5).forEach(p => {
    if(r[p]) {
      results[p] += r[p]
      total += r[p]
    }
  })
})

console.log(eachRound)

_.range(1, 5).forEach(p => {
  console.log("Player", p, (results[p] / total * 100).toFixed(2) + "%")
})



