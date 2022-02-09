import _ from "lodash";
import { Base, BaseState } from "../base";
import TictactoeMove from "./move";

const IN_PROGRESS = -1;
const DRAW = 0;
const WINNING_COMBINATIONS = [
  [new TictactoeMove(1,1),new TictactoeMove(1,2), new TictactoeMove(1,3)],
  [new TictactoeMove(2,1),new TictactoeMove(2,2), new TictactoeMove(2,3)],
  [new TictactoeMove(3,1),new TictactoeMove(3,2), new TictactoeMove(3,3)],

  [new TictactoeMove(1,1),new TictactoeMove(2,1), new TictactoeMove(3,1)],
  [new TictactoeMove(1,2),new TictactoeMove(2,2), new TictactoeMove(3,2)],
  [new TictactoeMove(1,3),new TictactoeMove(2,3), new TictactoeMove(3,3)],

  [new TictactoeMove(1,1),new TictactoeMove(2,2), new TictactoeMove(3,3)],
  [new TictactoeMove(1,3),new TictactoeMove(2,2), new TictactoeMove(3,1)],
]

export default class Tictactoe extends Base implements BaseState<TictactoeMove, Tictactoe> {
  private _winner;
  private _moves:Array<[number, TictactoeMove]> = [];

  get moves() {
    return this._moves;
  }

  get winner() {
    return this._winner
  }

  constructor(cloneFrom:Tictactoe = null) {
    super();
    if(cloneFrom) {
      this._moves = _.cloneDeep(cloneFrom.moves)
      this._winner = cloneFrom.winner;
    }
  }

  clone() {
    return new Tictactoe(this)
  }

  cloneAndRandomize(observer:number) {
    const st = new Tictactoe(this)
    st.playerToMove = observer;
    return st;
  }

  findWinner():number {
    if(this._moves.length < 5) {
      return IN_PROGRESS
    }

    let playerWinner = IN_PROGRESS; // default by end if not found playerWinner

    // lets collected each player moves
    this.eachPlayer.forEach(playerNum => {
      const playerMoves = _.map(_.filter(this._moves, ([player,]) => player === playerNum), ([, move]) => move);

      WINNING_COMBINATIONS.forEach( w => {
        const combination = _.intersectionWith(w, playerMoves, (a,b) => a.equal(b))
        if(combination.length === playerMoves.length && combination.length === 3) {
          playerWinner = playerNum; // winner
          return;
        }
      })
    });

    if(this._moves.length >= 9) {
      return DRAW //draw
    }

    return playerWinner // in progress
  }

  doMove(move: TictactoeMove) {
    // Store the played card in the current trick
    this._moves.push([this.playerToMove, move])

    // Find the next player
    this._playerToMove = this.getNextPlayer(this.playerToMove)

    const winner = this.findWinner();
    if(winner !== IN_PROGRESS && winner !== DRAW) {
      this._winner = winner;
    }
  }

  getMoves() {
    if(this._winner) return []; // terminate if winner er set

    const potientelMoves = [];
    _.range(1, 4).forEach(x => {
      _.range(1, 4).forEach(y => {
        const move = new TictactoeMove(x, y)
        const f = _.find(this._moves, ([playerNum , playerMove]) => playerMove.equal(move))
        if(!f) {
          potientelMoves.push(move)
        }
      })
    })

    return potientelMoves
  }

  getResult(player: number): number {
    if (this._winner === player) {
      return 1
    } else {
      return 0
    }
  }
}