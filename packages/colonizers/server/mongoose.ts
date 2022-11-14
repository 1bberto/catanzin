import Hoek from "hoek";
import mongoose from "mongoose";
import { Server } from "@hapi/hapi";

export default class Mongoose {
  name: string = "mongoose";

  register = (server: Server, options) => {
    options = Hoek.applyToDefaults(
      {
        mongodbUrl: null
      },
      options
    );

    Hoek.assert(
      options.mongodbUrl,
      "Missing required mongodbUrl property in options."
    );

    server.expose("mongoose", mongoose);

    mongoose.connect(options.mongodbUrl);
  };
}
