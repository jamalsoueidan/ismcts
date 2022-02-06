export default interface BaseState<C, B> {
  get numberOfPlayers():number;
  get playerToMove():number;
	get eachPlayer():Array<number>;
	get playerHands():any; //KeyIndex<Array<Card>>

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