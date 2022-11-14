import HexInfo from "../hex-info";
import {
  HexCornerCollection,
  HexEdgeCollection,
  HexTileCollection
} from "./collections/hex-collections";

export default class Board {
  height: number;

  width: number;

  hexInfo: HexInfo;

  game: any;

  corners: HexCornerCollection;

  edges: HexEdgeCollection;

  tiles: HexTileCollection;

  constructor(factory, options) {
    factory.defineProperties(this, {
      height: options.height,
      width: options.width,
      hexInfo: options.hexInfo,
      game: null
    });

    this.height = options.height;
    this.width = options.width;
    this.hexInfo = options.hexInfo;
    this.game = null;

    this.corners = new HexCornerCollection();
    this.edges = new HexEdgeCollection();
    this.tiles = new HexTileCollection();

    this.addEdge = this.addEdge.bind(this);
    this.addCorner = this.addCorner.bind(this);
    this.addTile = this.addTile.bind(this);
  }

  spatialQuery(optionsFunc) {
    var options = optionsFunc.bind(this)(this);
    return options.collection.query({
      within: { radius: options.radius, of: options.center }
    });
  }

  addTiles(tiles) {
    tiles.forEach(this.addTile);
  }

  addCorners(corners) {
    corners.forEach(this.addCorner);
  }

  addEdges(edges) {
    edges.forEach(this.addEdge);
  }

  addTile(tile) {
    this.tiles.push(tile);
    tile.addToBoard(this);
  }

  addCorner(corner) {
    this.corners.push(corner);
    corner.addToBoard(this);
  }

  addEdge(edge) {
    this.edges.push(edge);
    edge.addToBoard(this);
  }
}
