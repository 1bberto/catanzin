import mongoose from "mongoose";

function register(server, options, next) {
  server.route({
    method: "GET",
    path: "/lobby",
    handler: function(request, reply) {
      var Room = mongoose.model("Room");
      Room.find(
        {},
        {
          _id: 1,
          created: 1,
          gameOptions: 1,
          status: 1,
          users: 1
        }
      )
        .sort({ created: "desc" })
        .exec(function(err, rooms) {
          if (err) {
            return reply(err);
          }

          rooms.forEach(function(room) {
            room.url = "/room/" + room._id;
          }, this);

          reply.view("lobby/index", {
            rooms: rooms,
            script: "lobby/public"
          });
        });
    }
  });

  next();
}

register.attributes = {
  name: "web/lobby"
};

export default {
  register
};
