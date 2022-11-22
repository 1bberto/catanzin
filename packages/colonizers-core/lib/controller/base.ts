import MersenneTwister from "mersenne-twister";
import EmitterQueue from "../emitter-queue";
import PlayerRequest from "./request";
import SubHandler from "./subHandler";
import Handler from "./handler";
import Game from "../game-objects/game";

export default class BaseController {
  events: any;

  queue: EmitterQueue;

  game: Game;

  emitter: any;

  generator: MersenneTwister;

  constructor(game: Game, emitter) {
    this.events = {};
    this.queue = new EmitterQueue();

    this.game = game;
    this.emitter = emitter;

    // This requires that the game is in it's fully loaded state
    this.generator = new MersenneTwister(game.seed);
    for (var i = 0; i < game.rolls; i++) {
      this.generator.random();
    }
  }

  d6() {
    return Math.floor(this.generator.random() * 6 + 1);
  }

  getEventNames() {
    return Object.keys(this.events);
  }

  on(event, _if: any = null) {
    if (!this.events[event]) {
      this.events[event] = new Handler();
      this.queue.on(event, this.events[event].handle);
    }

    var sub = new SubHandler(_if);
    this.events[event].subs.push(sub);
    return sub;
  }

  pushEvent(options, callback) {
    var req = new PlayerRequest(
      {
        logger: options.logger,
        playerId: options.playerId,
        player: this.game.getPlayerById(options.playerId),
        emitter: this.emitter,
        game: this.game,
        data: options.data
      },
      callback
    );

    this.queue.emit(options.event, req);
  }
}
