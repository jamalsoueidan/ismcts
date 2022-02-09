import TictactoeMove from "./move";
import Tictactoe from "./tictactoe";

const NUM_PLAYERS = 2;
describe('Tictactoe test', () => {
  let game:Tictactoe;

  beforeAll(() => {
    game = new Tictactoe();
  })

  it('get potential moves', () => {
    const move = new TictactoeMove(1,1)
    game.doMove(move)
    expect(game.getMoves().length).toBe(8)
  })

  it.only('find winner and get result', () => {
    game.doMove(new TictactoeMove(1,1))
    game.doMove(new TictactoeMove(1,2))
    game.doMove(new TictactoeMove(2,2))
    game.doMove(new TictactoeMove(1,3))
    game.doMove(new TictactoeMove(3,3))
    expect(game.getResult(1)).toBe(1)
  })
})