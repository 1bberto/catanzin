import templates from "./html-templates";
import observableProps from "../game/observable-properties";

function PlayersModel(roomModel) {
  this.roomModel = roomModel;

  observableProps.defineProperties(this, {
    players: this.getPlayers
  });
}

PlayersModel.prototype.getPlayers = function() {
  return this.roomModel.otherPlayersOrdered;
};

export default {
  viewModel: PlayersModel,
  template: templates.players
};
