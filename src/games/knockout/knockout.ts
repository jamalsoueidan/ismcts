import Card, { RANKS, Suit, SUITS } from "./card";
import _ from 'lodash'
import BaseState from "../base";

interface KeyIndex<T> {
  [key: string]: T
}

/** A state of the game Knockout Whist.
		See http://www.pagat.com/whist/kowhist.html for a full description of the rules.
		This version of the game does not include the "dog's life" rule
		and the trump suit for each round is picked randomly rather than being chosen by one of the players.
	*/
export default class Knockout implements BaseState<Card, Knockout> {
  private _numberOfPlayers = 2;
  private _playerToMove = 1;
  private _tricksInRound = 7;
  private _playerHands:KeyIndex<Array<Card>> = {}; //Whats in each player hand
  private _discards = [] // Stores the cards that have been played already in this round
  private _currentTrick:Array<[number, Card]>  = [] //Current play on table
  private _trumpSuit:Suit; // Which type of suit is the strongest in this current trick
  private _tricksTaken:KeyIndex<number> = {} // Number of tricks taken by each player this round
  private _knockedOut:KeyIndex<boolean> = {} // Which players is knockOut (true is knockout, false is not)

  get playerHands() {
    return this._playerHands;
  }

  set playerHands(value) {
    this._playerHands = value;
  }

  get trumpSuit() {
    return this._trumpSuit;
  }

  get numberOfPlayers() {
    return this._numberOfPlayers;
  }

  get playerToMove() {
    return this._playerToMove;
  }

  get tricksInRound() {
    return this._tricksInRound;
  }

  get discards() {
    return this._discards
  }

  get currentTrick() {
    return this._currentTrick;
  }

  get currentTrickCards() {
    return _.map(this._currentTrick, ([player, card]) => card)
  }

  get tricksTaken() {
    return this._tricksTaken
  }

  get knockedOut() {
    return this._knockedOut
  }

  get eachPlayer() {
    return _.range(1, (this._numberOfPlayers+1))
  }

  get isRoundOver() {
    return _.isEmpty(this.playerHands[this._playerToMove])
  }

  get isTrickOver() {
   return _.isEmpty(this.currentTrick)
  }

	constructor(numberOfPlayers = 2, cloneFrom:Knockout = null) {
		this._numberOfPlayers = numberOfPlayers

    if(cloneFrom) {
      this._playerToMove =  cloneFrom?.playerToMove
      this._tricksInRound = cloneFrom?.tricksInRound
      this._playerHands  = _.cloneDeep(cloneFrom?.playerHands)
      this._discards     = _.cloneDeep(cloneFrom?.discards)
      this._currentTrick = _.cloneDeep(cloneFrom?.currentTrick)
      this._trumpSuit    = cloneFrom?.trumpSuit
      this._tricksTaken  = _.cloneDeep(cloneFrom?.tricksTaken)
      this._knockedOut   = _.cloneDeep(cloneFrom?.knockedOut)
    } else {
      this.deal();
    }
  }

  clone() {
    return new Knockout(this.numberOfPlayers, this)
  }

  cloneAndRandomize(observer:number):Knockout {
    const st:Knockout = new Knockout(this.numberOfPlayers, this)

		// The observer can see his own hand and the cards in the current trick, and can remember the cards played in previous tricks
		const seenCards:Card[] = _.union(st.playerHands[observer], st.discards, st.currentTrickCards)

		// The observer can't see the rest of the deck
		let unseenCards = _.xorWith(seenCards, st.getCardDeck(), _.isEqual);

		// Deal the unseen cards to the other players
		unseenCards = _.shuffle(unseenCards)
		this.eachPlayer.forEach((playerNum) => {
			if (playerNum != observer) {
				// Deal cards to player p
				// Store the size of player p's hand
				const numCards = this.playerHands[playerNum].length
				// Give player p the first numCards unseen cards
				st.playerHands[playerNum] = _.take(unseenCards, numCards)
				// Remove those cards from unseenCards
				unseenCards =  _.drop(unseenCards, numCards);
      }
    })

		return st
  }

  nextRound() {
    return this.knockedOut
  }

	getCardDeck():Card[] {
		// Construct a standard deck of 52 cards.
		//
    let deck = new Array()

		for(let i = 0; i < SUITS.length; i++)
      {
        for(let x = 0; x < RANKS.length; x++)
        {
          let card = new Card(RANKS[x], SUITS[i])
          deck.push(card);
        }
      }

      return deck;
  }

	deal() {
		// Reset the game state for the beginning of a new round, and deal the cards.
		//
		this._discards = []
		this._currentTrick = []
		this._tricksTaken = {}

		// Construct a deck, shuffle it, and deal it to the players
		let deck:Card[] = this.getCardDeck();
    deck = _.shuffle(deck);

    this.eachPlayer.forEach((playerNum) => {
      this._playerHands[playerNum] = _.take(deck, this._tricksInRound);
			deck = _.drop(deck, this._tricksInRound);
    })

		// Choose the trump suit for this round
		this._trumpSuit = SUITS[_.random(0,3)]
  }

	getNextPlayer(p:number):number {
    let next = (p % this._numberOfPlayers) + 1
		// Skip any knocked-out players
		while(next != p && this._knockedOut[next]) {
			next = (next % this._numberOfPlayers) + 1
    }
		return next
  }

	doMove(move:Card, verbose=false) {
    // Store the played card in the current trick
    this._currentTrick.push([this._playerToMove, move])

    // Remove the card from the player's hand
    _.remove(this.playerHands[this._playerToMove], card => card.equal(move))

    // Find the next player
    this._playerToMove = this.getNextPlayer(this._playerToMove)

    // If the next player has already played in this trick, then the trick is over
    if(_.find(this._currentTrick, ([player, ]) => player === this._playerToMove)) {
      // Sort the plays in the trick: those that followed suit (in ascending rank order), then any trump plays (in ascending rank order)
      const [leader, leadCard] = this._currentTrick[0]
      const suitedPlays = _.orderBy(this._currentTrick, [([, card]) => card.suit === leadCard.suit, ([, card]) => card.rank]);
      const trumpPlays  = _.orderBy(this._currentTrick, [([, card]) => card.suit === this._trumpSuit, ([, card]) => card.rank]);
      const sortedPlays = _.union(suitedPlays, trumpPlays);

      // The winning play is the last element in sortedPlays
      const [trickWinner] = _.last(sortedPlays)

      // Update the game state
      if(!this._tricksTaken[trickWinner]) {
        this._tricksTaken[trickWinner] = 1;
      } else {
        this._tricksTaken[trickWinner] += 1
      }

      if(verbose) {
        console.log(trickWinner, "first suit", leadCard.suit, "board suit", this.trumpSuit)
      }

      this._discards = _.concat(this._discards, _.map(this._currentTrick, ([player, card]) => card))
      this._currentTrick = []
      this._playerToMove = trickWinner

      // If the next player's hand is empty, this round is over
      if(_.isEmpty(this.playerHands[this._playerToMove])) {
        this._tricksInRound -= 1
        this.eachPlayer.forEach((playerNum) => {
          if(!this._tricksTaken[playerNum]) {
            this._knockedOut[playerNum] = true;
          }
        });

        // If one player is left that are not knockout, the game is over
        if (_.filter(this._knockedOut, (value) => !value).length <= 1) {
          this._tricksInRound = 0
        }

        //this.deal()
      }
    }
  }

	getMoves():Card[] {
		const hand = this._playerHands[this._playerToMove]
		if (_.isEmpty(this._currentTrick)) {
			// May lead a trick with any card
			return hand
    } else {
			const [leader, leadCard] = this._currentTrick[0]
			// Must follow suit if it is possible to do so
			const cardsInSuit = _.filter(hand, (card) => card.suit === leadCard.suit)
			if (!_.isEmpty(cardsInSuit)) {
				return cardsInSuit
      }
			else {
				// Can't follow suit, so can play any card
				return hand
      }
    }
  }

	getResult(player) {
		if (this._knockedOut[player])
      return 0;
    else
      return 1
  }

	toString() {
		// Return a human-readable representation of the state
		//
    console.log('.....................................................')
		console.log("Round:", this._tricksInRound)
		console.log("PlayerToMove:", this._playerToMove)
		console.log(JSON.stringify(this.playerHands, null, 4))
		console.log("TricksTaken:", this._tricksTaken)
		console.log("Trump:", this._trumpSuit)
    console.log("Knockout:", this._knockedOut)
		console.log("CurrentTrick:")
		console.log(this._currentTrick)
    console.log('.....................................................')
  }
}