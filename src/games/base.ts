import _ from "lodash";

export interface BaseState<C, B> {
  get numberOfPlayers():number;
  get playerToMove():number;
	get eachPlayer():Array<number>;

	/** Return the player to the left of the specified player, skipping players who have been knocked out */
	getNextPlayer(p):number;

  /** Create a deep clone of this game state. */
	clone():B;

	/** Create a deep clone of this game state, randomizing any information not visible to the specified observer player. */
	cloneAndRandomize(observer):B;

	/** Update a state by carrying out the given move. Must update playerToMove.*/
	doMove(move);

	/** Get all possible moves from this state. */
	getMoves():C[]

	/** Get the game result from the viewpoint of player. */
	getResult(player:number):number;
}

export class Base {
  protected _numberOfPlayers = 2;
  protected _playerToMove = 1;

  get numberOfPlayers() {
    return this._numberOfPlayers;
  }

  get playerToMove() {
    return this._playerToMove;
  }

  protected set playerToMove(value) {
    this._playerToMove = value;
  }

  get eachPlayer() {
    return _.range(1, (this._numberOfPlayers+1))
  }

	getNextPlayer(p:number):number {
    return (p % this._numberOfPlayers) + 1
  }


}