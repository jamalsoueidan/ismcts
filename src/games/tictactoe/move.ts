import Move from "../move";

export default class TictactoeMove implements Move {
  private _x:number;
  private _y:number;

  constructor(x:number, y:number) {
		this._x = x
		this._y = y
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

	toString() {
		return "[" + this._x  + this._y + "]"
  }

  equal(other) {
		return this._x === other.x && this._y === other.y
  }

  notEqual(other) {
		return this._x != other.x || this._y != other.y
  }
}