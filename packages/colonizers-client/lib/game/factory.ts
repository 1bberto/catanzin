import Game from "./game";
import Board from "./board";
import HexTile from "./hex-tile";
import HexCorner from "./hex-corner";
import HexEdge from "./hex-edge";
import Player from "./player";
import observableProps from "./observable-properties";

export default class Factory {
  constructor(options) {
    this.tileset = options.tileset;

    // Process tileset, converting image data uris to image elements
    Object.keys(this.tileset.tiles).forEach(function(key) {
      if (this.tileset.tiles[key].bgimage) {
        var img = new window.Image();
        img.src = this.tileset.tiles[key].bgimage;
        this.tileset.tiles[key].bgimage = img;
      }
    }, this);
  }

  createGame(options) {
    return new Game(this, options);
  }

  createBoard(options) {
    return new Board(this, options);
  }

  createHexTile(options) {
    return new HexTile(this, options, this.tileset);
  }

  createHexCorner(options) {
    return new HexCorner(this, options);
  }

  createHexEdge(options) {
    return new HexEdge(this, options);
  }

  createPlayer(options) {
    return new Player(this, options);
  }

  defineProperties() {
    observableProps.defineProperties.apply(this, arguments);
  }
}
