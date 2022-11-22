import emitter from "component-emitter";
import Player from "colonizers-core/lib/game-objects/player";
export default class UiPlayer extends Player {
  constructor(factory, options) {
    super(factory, options);
    emitter(this);
    this.color = ["#d9534f", "#5cb85c", "#428bca", "#d9534f"][options.index];
  }

  distribute(resources) {
    super.distribute(resources);
    this.emit("updated");
  }

  spend(resources) {
    super.spend(resources);
    this.emit("updated");
  }

  addVictoryPoint(devCard) {
    super.addVictoryPoint(devCard);
    this.emit("updated");
  }
}
