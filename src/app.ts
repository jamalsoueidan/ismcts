import _ from "lodash";
import Card from "./games/knockout/card";
import GameState from "./games/knockout/knockout";
import Node from "./node";


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
}

const agents = {
  "1": 1000,
  "2": 100,
  "3": 100,
  "4": 100,
}

playGame(4, agents)



