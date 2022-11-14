import core from "./game-objects";
import props from "./props";

export default class Factory {
  createGame(options) {
    return new core.Game(this, options);
  }

  createBoard(options) {
    return new core.Board(this, options);
  }

  createHexTile(options) {
    return new core.HexTile(this, options);
  }

  createHexCorner(options) {
    return new core.HexCorner(this, options);
  }

  createHexEdge(options) {
    return new core.HexEdge(this, options);
  }

  createPlayer(options) {
    return new core.Player(this, options);
  }

  defineProperties() {
    props.defineProperties.apply(this, arguments);
  }
}
