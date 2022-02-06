export default interface Move {
	toString():string;
	equal(other):boolean;
	notEqual(other):boolean;
}