import Board from "./board";
import BoardEntity from "./board-entity";

export default class HexTile extends BoardEntity {
  id: any;

  type: string;

  tileType: string;

  value: any;

  board: Board;

  constructor(factory, options) {
    super(factory, options);

    factory.defineProperties(this, {
      id: options.id,
      type: options.type,
      value: options.value,
      isResource: this.isResource
    });
  }

  addToBoard(board: Board) {
    this.board = board;
  }

  isResource() {
    return this.type !== "sea" && this.type !== "desert";
  }

  getAdjacentTiles() {
    return this.spatialQuery(board => {
      return {
        collection: board.tiles,
        radius: board.hexInfo.apothem * 2.1,
        center: this.center
      };
    });
  }

  getAdjacentCorners() {
    return this.spatialQuery(board => {
      return {
        collection: board.corners,
        radius: board.hexInfo.circumradius * 1.1,
        center: this.center
      };
    });
  }
}
