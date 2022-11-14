import Board from "./board";
import BoardEntity from "./board-entity";

export default class HexEdge extends BoardEntity {
  id: any;

  ends: any;

  owner: any;

  isBuildable: boolean;

  constructor(factory, options) {
    super(factory, options);

    factory.defineProperties(this, {
      id: options.id,
      ends: options.ends,
      owner: null,
      isBuildable: true
    });
  }

  addToBoard(board) {
    this.board = board;
  }

  getAdjacentCorners() {
    return this.spatialQuery((board: Board) => {
      return {
        collection: board.corners,
        radius: board.hexInfo.circumradius * 0.6,
        center: this.center
      };
    });
  }

  getAdjacentEdges() {
    return this.spatialQuery((board: Board) => {
      return {
        collection: board.edges,
        radius: board.hexInfo.apothem * 1.1,
        center: this.center
      };
    });
  }

  getAdjacentTiles() {
    return this.spatialQuery((board: Board) => {
      return {
        collection: board.tiles,
        radius: board.hexInfo.apothem * 1.1,
        center: this.center
      };
    });
  }

  build(player) {
    this.owner = player.id;
    this.isBuildable = false;
  }
}
