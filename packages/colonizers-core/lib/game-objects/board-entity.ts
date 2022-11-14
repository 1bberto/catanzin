import Board from "./board";

export default class BoardEntity {
  center: any;

  board: Board;

  constructor(factory, options) {
    factory.defineProperties(this, {
      center: options.center,
      board: null
    });
  }

  spatialQuery(callback) {
    if (this.board) {
      return this.board.spatialQuery(callback);
    } else {
      return [];
    }
  }
}
