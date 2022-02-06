import _ from "lodash";
import Card from "./games/knockout/card";
import GameState from "./games/knockout/knockout";
import Move from "./games/move";
import Node from "./node";


const state = new GameState(4)
const copy = state.clone();
let m:Move;
let tricksInRound = 0;

console.log("playersHands", state.playerHands)

while (!_.isEmpty(state.getMoves())) {
  if (state.playerToMove == 1) {
    m = Node.ISMCTS(state, 1000)
  }
  else {
    m = Node.ISMCTS(state, 100)
  }
  console.log('Best move', m, "For player", state.playerToMove, state.trumpSuit)
  state.doMove(m as Card)

  if(state.isRoundOver) {
    console.log(state.tricksTaken)
    //state.toString()
    //state.nextRound();
  }

  if(state.isTrickOver) {
    console.log('-------------------------------')
  }
}

let someoneWon = false
state.eachPlayer.forEach((playerNum) => {
  if(state.getResult(playerNum) > 0) {
    console.log("Player " + playerNum + " wins!")
    someoneWon = true
  }
})

if(!someoneWon) {
  console.log("Nobody wins!")
}

