import _ from "lodash";
import Card from "./card";
import Knockout from "./knockout";

const NUM_PLAYERS = 4;
describe('Knockout test', () => {
  let knockout:Knockout;

  beforeAll(() => {
    knockout = new Knockout(NUM_PLAYERS);
  })

  it('num players should be to', () => {
    expect(knockout.numberOfPlayers).toBe(NUM_PLAYERS)
  })

  it('each player must have 7 cards', () => {
    knockout.deal();
    const keys = Object.keys(knockout.playerHands)
    expect(keys.length).toBe(NUM_PLAYERS)
    expect(knockout.playerHands[1].length).toBe(7)
  })

  it('after first move, currentTrick have 1 object', () => {
    let move = _.sample(knockout.getMoves());
    knockout.doMove(move);
    expect(knockout.currentTrick.length).toBe(1)
  })
})