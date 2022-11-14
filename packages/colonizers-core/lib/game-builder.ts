import _ from "lodash";
import ScenarioBuilder from "./scenario-builder";
import scenarioFile from "../scenarios/default";

export default class GameBuilder {
  getGame(players, gameOptions) {
    var plys = _.shuffle(players);
    var scenarioBuilder = new ScenarioBuilder({
      scenario: scenarioFile,
      numPlayers: players.length,
      gameOptions: gameOptions
    });
    var scenario = scenarioBuilder.getScenario();

    return {
      seed: Date.now(),
      allowance: scenario.allowance,
      board: scenario.board,
      players: plys.map(function(player) {
        return {
          id: player.id
        };
      })
    };
  }
}
