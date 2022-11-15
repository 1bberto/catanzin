import Boom from "@hapi/boom";
import Joi from "joi";
import Hoek from "hoek";
import mongoose from "mongoose";
import { Server, Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";

export default class RoomsApi {
  name: string = "api/rooms";

  register(server: Server, options) {
    options = Hoek.applyToDefaults({ basePath: "" }, options);

    var broadcastUsers = function(roomId) {
      var Room = mongoose.model("Room");
      var pubsub = (server.plugins as any).pubsub;

      (Room as any).getUsers(roomId, function(err, users) {
        if (err) {
          return;
        }

        pubsub.publish({
          room: roomId,
          event: "room-users",
          data: users
        });
      });
    };

    var io = server.plugins["hapi-io"].io;

    io.on("connection", function(socket) {
      socket.on("enter-room", function(data) {
        socket.join(data.roomId);
        broadcastUsers(data.roomId);
      });
    });

    var getRoom = (opts: any = {}) => {
      opts = opts || {};

      return (
        request: Request,
        reply: ResponseToolkit
      ): ResponseObject | any => {
        var Room = mongoose.model("Room");

        var find = Room.findById(request.params.roomId);

        if (opts.users) {
          find.populate("users.user");
        }

        find.exec(function(err, room) {
          if (err) {
            return reply.response(new Boom.Boom(err));
          }

          if (!room) {
            return reply.response(Boom.notFound());
          }

          return reply.response(room);
        });
      };
    };

    server.route({
      method: "GET",
      path: options.basePath + "/rooms",
      options: {
        description: "Returns a list of rooms.",
        // plugins: {
        //   "hapi-io": "rooms"
        // },
        auth: {
          strategy: "cookie"
        },
        handler: (request: Request, reply: ResponseToolkit) => {
          var Room = mongoose.model("Room");

          Room.find({})
            .populate("users.user")
            .sort("-created")
            .select("_id users created gameOptions")
            .exec(function(err, rooms) {
              if (err) {
                return reply.response(new Boom.Boom(err));
              }

              reply.response(rooms);
            });
        }
      }
    });

    server.route({
      method: "GET",
      path: options.basePath + "/rooms/{roomId}",
      options: {
        description:
          "Returns a single room, specified by the roomId parameter.",
        validate: {
          params: {
            roomId: (server.plugins as any).validations.roomId.required()
          }
        },
        auth: {
          strategy: "cookie"
        },
        pre: [
          {
            assign: "room",
            method: getRoom()
          }
        ],
        handler: (
          request: Request,
          reply: ResponseToolkit
        ): ResponseObject | any => {
          return reply.response(request.pre.room);
        }
      }
    });

    server.route({
      method: "GET",
      path: options.basePath + "/rooms/{roomId}/users",
      options: {
        description:
          "Returns a list of users for a single room, " +
          "specified by the roomId parameter.",
        // plugins: {
        //   "hapi-io": "room-users"
        // },
        validate: {
          params: {
            roomId: (server.plugins as any).validations.roomId.required()
          }
        },
        auth: {
          strategy: "cookie"
        },
        pre: [
          {
            assign: "room",
            method: getRoom({ users: true })
          }
        ],
        handler: (
          request: Request,
          reply: ResponseToolkit
        ): ResponseObject | any => {
          var users = request.pre.room.users.map(x => x.user);

          return reply.response(users);
        }
      }
    });

    server.route({
      method: "POST",
      path: options.basePath + "/rooms",
      options: {
        description: "Creates a room.",
        // plugins: {
        //   "hapi-io": "create-room"
        // },
        auth: {
          strategy: "cookie"
        },
        validate: {
          payload: Joi.object().keys({
            scenario: Joi.string()
              .required()
              .description("Colonizers scenario ID"),
            numPlayers: Joi.number()
              .integer()
              .required()
              .min(3)
              .max(4)
              .description("Number of players")
          })
        },
        handler: (
          request: Request,
          reply: ResponseToolkit
        ): ResponseObject | any => {
          const Room = mongoose.model("Room");

          const { numPlayers, scenario } = request.payload as any;

          const data = {
            owner: request.auth.credentials.userId,
            numPlayers: numPlayers,
            gameOptions: {
              numPlayers: numPlayers,
              scenario: scenario
            }
          };

          Room.create(data, function(err, room) {
            if (err) {
              return reply.response(new Boom.Boom(err));
            }

            reply.response(room);
          });
        }
      }
    });

    server.route({
      method: "POST",
      path: options.basePath + "/rooms/{roomId}/join",
      options: {
        description: "Joins a single room, specified by the roomId parameter.",
        // plugins: {
        //   "hapi-io": "join-room"
        // },
        auth: {
          strategy: "cookie"
        },
        validate: {
          params: {
            roomId: (server.plugins as any).validations.roomId.required()
          }
        },
        pre: [
          {
            assign: "room",
            method: getRoom()
          },
          {
            assign: "autoStart",
            method: function(request, reply) {
              function autoStart(pubsub, roomId) {
                return function() {
                  var Room = mongoose.model("Room");

                  Room.findById(roomId, function(err, room) {
                    if (err || !room) {
                      return;
                    }

                    room.start(function() {
                      pubsub.publish({
                        room: room.id,
                        event: "game-started"
                      });
                    });
                  });
                };
              }

              reply.response(
                autoStart((server.plugins as any).pubsub, request.params.roomId)
              );
            }
          }
        ],
        handler: (
          request: Request,
          reply: ResponseToolkit
        ): ResponseObject | any => {
          var room = request.pre.room;
          room.join(request.auth.credentials.userId, function(err, member) {
            if (err) {
              return reply.response(new Boom.Boom(err));
            }

            if (member && room.users.length === room.numPlayers) {
              setTimeout(request.pre.autoStart, 2000);
            }

            reply.response(member);

            broadcastUsers(room.id);
          });
        }
      }
    });

    server.route({
      method: "POST",
      path: options.basePath + "/rooms/{roomId}/leave",
      options: {
        description: "Leaves a single room, specified by the roomId parameter.",
        // plugins: {
        //   "hapi-io": "leave-room"
        // },
        auth: {
          strategy: "cookie"
        },
        validate: {
          params: {
            roomId: (server.plugins as any).validations.roomId.required()
          }
        },
        pre: [
          {
            assign: "room",
            method: getRoom()
          }
        ],
        handler: (
          request: Request,
          reply: ResponseToolkit
        ): ResponseObject | any => {
          var room = request.pre.room;
          room.leave(request.auth.credentials.userId, function(err) {
            if (err) {
              return reply.response(new Boom.Boom(err));
            }

            reply.response();

            broadcastUsers(room.id);
          });
        }
      }
    });
  }
}
