import Joi from "joi";
import mongoose from "mongoose";

exports.register = function(server, options, next) {
  server.route({
    method: "GET",
    path: "/room/{roomId}",
    config: {
      validate: {
        params: {
          roomId: Joi.string().required()
        }
      }
    },
    handler: function(request, reply) {
      var Room = mongoose.model("Room");

      Room.findById(request.params.roomId, function(err: any, room) {
        if (err) {
          return reply(err);
        }

        if (room.status === "open") {
          reply.view("room/room", {
            context: {
              roomId: request.params.roomId,
              userId: request.auth.credentials.userId
            },
            script: "room/room"
          });
        } else {
          reply.view(
            "room/game",
            {
              context: {
                roomId: request.params.roomId,
                userId: request.auth.credentials.userId
              },
              script: "room/game"
            },
            {
              layout: false
            }
          );
        }
      });
    }
  });

  next();
};

exports.register.attributes = {
  name: "web/room"
};
