import _ from "lodash";
import BaseState from "./games/base";
import Move from "./games/move";

export default class Node {
  private _move:Move;
  private _parentNode:Node;
  private _childNodes:Node[] = []
  private _wins = 0; // Wins is from the viewpoint of playerJustMoved (the first card)
  private _visits = 0;
  private _avails = 1;
  private _playerJustMoved:number;

  get playerJustMoved() {
    return this._playerJustMoved;
  }

  get move() {
    return this._move;
  }

  get childNodes() {
    return this._childNodes;
  }

  get wins() {
    return this._wins
  }

  get visits() {
    return this._visits;
  }

  get avails() {
    return this._avails
  }

  set avails(value) {
    this._avails = value;
  }

  get parentNode() {
    return this._parentNode
  }

	constructor( move = null, parent = null, playerJustMoved = null) {
		this._move = move // the move that got us to this node - "null" for the root node
		this._parentNode = parent // "null" for the root node
		this._playerJustMoved = playerJustMoved // who is playing
  }

  addChild(m, p) {
		const n = new Node(m, this, p)
		this._childNodes.push(n)
		return n
  }

	getUntriedMoves(legalMoves:Move[]):Move[] {
    // Return the elements of legalMoves for which this node does not have children.

    // Find all moves for which this node *does* have children
    const triedMoves:Move[] = []
    this.childNodes.forEach( c => triedMoves.push(c.move) );

    // Return all moves that are legal but have not been tried yet
    return _.differenceWith(legalMoves, triedMoves, _.isEqual);
  }


  UCBSelectChild(legalMoves:Move[], exploration = 1.41) {
    /* Use the UCB1 formula to select a child node, filtered by the given list of legal moves.
      exploration is a constant balancing between exploitation and exploration, with default value 1.41 (approximately sqrt(2) / 2)
    */

    // Filter the list of children by the list of legal moves
    const legalChildren = _.filter(this.childNodes, node => _.find(legalMoves, c => c.equal(node.move)) !== undefined)

    // Get the child with the highest UCB score
    const s = _.maxBy(legalChildren, l => {
      if (l.visits === 0) {
        return Number.MAX_SAFE_INTEGER;
      }

      return (l.wins / l.visits) + exploration * Math.sqrt(Math.log(l.avails)/l.visits)
    })

    // Update availability counts -- it is easier to do this now than during backpropagation
    legalChildren.forEach(l => l.avails += 1)

    // Return the child selected above
    return s
  }

  update(terminalState:BaseState<any, any>) {
		// Update this node - increment the visit count by one, and increase the win count by the result of terminalState for self.playerJustMoved.
		this._visits += 1

		if (this.playerJustMoved) {
			this._wins += terminalState.getResult(this.playerJustMoved)
    }
  }

  toString() {
		return this._move +":win("+ this._wins+")  visits("+ this._visits+") avails("+ this._avails + ") p(" + this.playerJustMoved + ")"
  }

  treeToString(indent) {
		// Represent the tree as a string, for debugging purposes.
		let s = this.indentString(indent) + this.toString()
		this._childNodes.forEach(c => {
      s += c.treeToString(indent+1)
    });

		return s
  }

  indentString(indent) {
		let s = "\n"
		for (let i=0; i<indent; i++) {
			s += "| "
    }
		return s
  }

  childrenToString() {
		let s = ""
		this._childNodes.forEach(c => {
			s += c.toString() + "\n"
    });
		return s
  }

  static ISMCTS(rootstate:BaseState<any, any>, itermax = 100, verbose = false) {
    /* Conduct an ISMCTS search for itermax iterations starting from rootstate.
      Return the best move from the rootstate.
    */

    const rootnode = new Node()

    _.times(itermax, () => {
      let node = rootnode

      // Determinize
      const state:BaseState<any, any> = rootstate.cloneAndRandomize(rootstate.playerToMove)

      // Select
      while(!_.isEmpty(state.getMoves()) && _.isEmpty(node.getUntriedMoves(state.getMoves()))) { // node is fully expanded and non-terminal
        node = node.UCBSelectChild(state.getMoves())
        state.doMove(node.move)
      }

      // Expand
      const untriedMoves = node.getUntriedMoves(state.getMoves())
      if(!_.isEmpty(untriedMoves)) { // if we can expand (i.e. state/node is non-terminal)
        const m = _.sample(untriedMoves)
        const player = state.playerToMove
        state.doMove(m)
        node = node.addChild(m, player) // add child and descend tree
      }
      // Simulate
      while(!_.isEmpty(state.getMoves())) { // while state is non-terminal
        const move = _.sample(state.getMoves())
        state.doMove(move)
      }
      // Backpropagate
      while(node) { // backpropagate from the expanded node and work back to the root node
        node.update(state)

        node = node.parentNode
      }
    })

    // Output some information about the tree - can be omitted
    if(verbose) {
      console.log(rootnode.treeToString(0))
    }
    return _.maxBy(rootnode.childNodes, c => c.visits).move // return the move that was most visited
  }
}