import emitter from "component-emitter";
import props from "../game/observable-properties";

export default function PlayerModel(user, player) {
  emitter(this);

  props.copyObservables(this, user, player);
  this.user = user || {};
  this.player = player || {};
}
