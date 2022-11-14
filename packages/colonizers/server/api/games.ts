import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import Hoek from "hoek";
import mongoose from "mongoose";
import { Server, Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";

export default class GamesApi {
  name: string = "api/games";

  register(server: Server, options) {
    options = Hoek.applyToDefaults({ basePath: "" }, options);

    var io = server.plugins["hapi-io"].io;

    io.on("connection", function(socket) {
      socket.on("join-game", function(roomId) {
        socket.join("game/" + roomId);
      });
    });

    var loadRoom = (
      request: Request,
      reply: ResponseToolkit
    ): ResponseObject | any => {
      var Room = mongoose.model("Room");

      Room.findById(request.params.roomId, function(err, room) {
        if (err) {
          return reply.response(err);
        }

        if (!room || room.status === "open") {
          return reply.response(Boom.notFound());
        }

        return reply.response(room);
      });
    };

    server.route({
      method: "GET",
      path: options.basePath + "/rooms/{roomId}/game",
      options: {
        description: "Returns the current state of a specific game.",
        // plugins: {
        //   "hapi-io": "get-game"
        // },
        // validate: {
        //   params: {
        //     roomId: (server.plugins as any).validations.roomId.required()
        //   }
        // },
        auth: {
          strategy: "cookie"
        },
        pre: [
          {
            assign: "room",
            method: loadRoom
          }
        ]        
      },
      handler: (
        request: Request,
        toolkit: ResponseToolkit
      ): ResponseObject => {
        return toolkit.response(request.pre.room.game);
      }
    });

    server.route({
      method: "GET",
      path: options.basePath + "/rooms/{roomId}/game/stream",
      options: {
        description: "Returns a list of events for a specific game.",
        // validate: {
        //   params: {
        //     roomId: (server.plugins as any).validations.roomId.required()
        //   }
        // },
        auth: {
          strategy: "cookie"
        },
        pre: [
          {
            assign: "room",
            method: loadRoom
          }
        ]        
      },
      handler: (
        request: Request,
        toolkit: ResponseToolkit
      ): ResponseObject | any => {
        var GameEvent = mongoose.model("GameEvent");

        GameEvent.find({ room: request.pre.room._id }, function(err, events) {
          return toolkit.response(events);
        });
      }
    });

    server.route({
      method: "POST",
      path: options.basePath + "/rooms/{roomId}/game/stream",
      options: {
        description: "Triggers an event for a specific game.",
        // plugins: {
        //   "hapi-io": "game-event"
        // },
        // validate: {
        //   params: {
        //     roomId: (server.plugins as any).validations.roomId.required()
        //   },
        //   payload: {
        //     event: Joi.string()
        //       .lowercase()
        //       .required()
        //       .description("Event name"),
        //     data: Joi.object()
        //       .optional()
        //       .description("Event data")
        //   }
        // },
        auth: {
          strategy: "cookie"
        },
        pre: [
          {
            assign: "room",
            method: loadRoom
          }
        ]        
      },
      handler: (
        request: Request,
        toolkit: ResponseToolkit
      ): ResponseObject | any => {
        var room = request.pre.room;

        var gameContext = room.getGameContext({
          postEvent: function(event, data) {
            var pubsub = (server.plugins as any).pubsub;
            pubsub.publish({
              room: "game/" + room.id,
              event: event,
              data: data
            });
          }
        });

        const {event, data} = request.payload as any;

        gameContext.pushEvent(
          {
            playerId: request.auth.credentials.user?.toString(),
            event: event,
            data: data
          },
          toolkit
        );
      }
    });
  }
}
