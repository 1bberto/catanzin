import mongoose from "mongoose";
import { Server, Request, ResponseToolkit } from "@hapi/hapi";

export default class LobbyPage {
  name: string = "web/lobby";

  register(server: Server) {
    server.route({
      method: "GET",
      path: "/lobby",
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        var Room = mongoose.model("Room");

        return new Promise(resolve => {
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
                resolve(err);
              }

              rooms.forEach(function(room) {
                room.url = "/room/" + room._id;
              }, this);

              resolve(
                reply.view("lobby/index", {
                  rooms: rooms,
                  script: "lobby/public"
                })
              );
            });
        });
      }
    });
  }
}
