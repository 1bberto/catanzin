import Joi from "@hapi/joi";
import { Server } from "@hapi/hapi";

export default class Validations {
  name: string = "validations";
  register(server: Server, options) {
    var mongoId = Joi.string()
      .lowercase()
      .length(24);

    server.expose("mongoId", mongoId);
    server.expose("roomId", mongoId.description("Room ID"));
  }
}
