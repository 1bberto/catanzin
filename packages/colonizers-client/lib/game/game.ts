import emitter from "component-emitter";
import Game from "colonizers-core/lib/game-objects/game";

export default class UiGame extends Game {
  emit: any;

  constructor(factory, options) {
    super(factory, options);
    emitter(this);
  }

  offerTrade(options) {
    super.offerTrade(options);
    this.emit("TradeOffered");
  }

  draw() {
    this.emit("draw");
  }

  showBuildableSettlements() {
    var currentPlayer = this.currentPlayer;
    var corners = this.getBuildableCornersForCurrentPlayer();

    corners.forEach(function(corner) {
      corner.show(currentPlayer);
    });

    this.draw();
  }

  showBuildableCities() {
    var currentPlayer = this.currentPlayer;
    var settlements = this.getSettlementsForPlayer(currentPlayer);

    settlements.forEach(function(settlement) {
      settlement.show(currentPlayer);
    });

    this.draw();
  }

  showBuildableEdges(cornerId) {
    var currentPlayer = this.currentPlayer;
    var edges = this.getBuildableEdgesForCurrentPlayer(cornerId);

    edges.forEach(function(edge) {
      edge.show(currentPlayer);
    });

    this.draw();
  }

  hideBuildableEntities() {
    this.board.corners
      .query({
        buildable: true
      })
      .forEach(function(corner) {
        corner.hide();
      });

    this.board.edges
      .query({
        buildable: true
      })
      .forEach(function(edge) {
        edge.hide();
      });

    this.draw();
  }
}
