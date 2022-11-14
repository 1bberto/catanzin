import { DevelopmentCards } from "./development-cards";
import { Resources } from "./resources";
import { VictoryPoints } from "./victory-points";

export default class Player {
  id: any;

  resources: Resources;

  developmentCards: DevelopmentCards;

  victoryPoints: VictoryPoints;

  knightsPlayed: number;

  longestRoad: number;

  constructor(factory, options) {
    factory.defineProperties(this, {
      id: options.id,
      resources: new Resources(factory),
      developmentCards: new DevelopmentCards(factory),
      victoryPoints: new VictoryPoints(factory),
      knightsPlayed: 0,
      longestRoad: 0
    });
  }

  hasResources(resources) {
    var value;

    for (var resource in resources) {
      value = resources[resource];
      if (this.resources[resource] < value) {
        return false;
      }
    }

    return true;
  }

  distribute(resources) {
    var total = 0;
    var value;

    for (var resource in resources) {
      value = resources[resource];
      total += value;
      this.resources[resource] += value;
    }

    this.resources.total += total;
    this.longestRoad = 0;
  }

  spend(resources) {
    var total = 0;
    var value;

    for (var resource in resources) {
      value = resources[resource];
      total -= value;
      this.resources[resource] -= value;
    }

    this.resources.total -= total;
  }

  addVictoryPoint(devCard) {
    if (devCard) {
      this.victoryPoints.public++;
    }

    this.victoryPoints.actual++;
  }
}
