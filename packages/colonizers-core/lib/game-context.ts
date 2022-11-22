import EmitterQueue from "./emitter-queue";
import Factory from "./factory";
import GameCoordinator from "./game-coordinator";
import GameSerializer from "./game-serializer";
import GameBuilder from "./game-builder";
import GameController from "./controller";

class GameContext {
  gameSerializer: GameSerializer;

  game: any;

  controller: GameController;

  coordinator: GameCoordinator;

  constructor(options, done: any = null) {
    var factory = options.factory || new Factory();

    this.gameSerializer = new GameSerializer(factory);
    this.game = this.gameSerializer.deserialize(options.game);

    var emitterQueue = new EmitterQueue();

    var doneReplaying = () => {
      this.controller = new GameController(this.game, emitterQueue);

      if (options.preEvent) {
        emitterQueue.pre(options.preEvent);
      }

      if (options.postEvent) {
        emitterQueue.post(options.postEvent);
      }

      if (done) {
        done(this);
      }
    };

    this.coordinator = new GameCoordinator(emitterQueue, this.game);

    var events = options.events || [];

    if (events.length) {
      emitterQueue.onceDrain(doneReplaying);
      events.forEach(function(event) {
        emitterQueue.emit(event.name, event.data);
      });
    } else {
      doneReplaying();
    }
  }

  start() {
    if (this.controller) {
      this.controller.start();
    }
  }

  getState() {
    return this.gameSerializer.serialize(this.game);
  }

  pushEvent(options, callback) {
    this.controller.pushEvent(options, callback);
  }

  static fromScenario = function(options, done) {
    var gameBuilder = new GameBuilder();
    var game = gameBuilder.getGame(options.players, options.gameOptions);

    return new GameContext(
      {
        game: game,
        factory: options.factory,
        postEvent: options.postEvent,
        preEvent: options.preEvent
      },
      done
    );
  };

  static fromSave = function(options, done = null) {
    return new GameContext(options, done);
  };
}

export default GameContext;
