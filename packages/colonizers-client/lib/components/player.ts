import templates from "./html-templates";
import observableProps from "../game/observable-properties";

function PlayerModel(roomModel) {
  this.roomModel = roomModel;
  this.actions = roomModel.actions;

  observableProps.defineProperties(this, {
    player: this.getPlayer,
    user: this.getUser,
    isPlayer: this.isPlayer
  });
}

PlayerModel.prototype.isPlayer = function() {
  return typeof this.roomModel.thisPlayer === "object";
};

PlayerModel.prototype.getPlayer = function() {
  return this.roomModel.thisPlayerOrEmpty.player;
};

PlayerModel.prototype.getUser = function() {
  return this.roomModel.thisPlayerOrEmpty.user;
};

export default {
  viewModel: PlayerModel,
  template: templates.player
};
