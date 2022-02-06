import Move from "../move";

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
export type Suit = 'C' | 'D' | 'H' | 'S'

// suit must be a string of length 1, one of 'C' (Clubs), 'D' (Diamonds), 'H' (Hearts) or 'S' (Spades)
export const SUITS:Suit[] = ["C", "D", "H", "S"];

// rank must be an integer between 2 and 14 inclusive (Jack=11, Queen=12, King=13, Ace=14)
export const RANKS:Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export default class Card implements Move {
  private _rank:Rank;
  private _suit:Suit;

	constructor(rank:Rank, suit:Suit) {
		this._rank = rank
		this._suit = suit
  }

	toString() {
		return "[" + this.rank  + this.suit + "]"
  }

	equal(other) {
		return this.rank === other.rank && this.suit === other.suit
  }

	notEqual(other) {
		return this.rank != other.rank || this.suit != other.suit
  }

	get suit() {
		return this._suit;
	}

	get rank() {
		return this._rank;
	}
}