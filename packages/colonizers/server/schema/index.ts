import mongoose from "mongoose";
import AuthAttempt from "./auth-attempt";
import GameEvent from "./game-event";
import Room from "./room";
import Session from "./session";
import User from "./user";
import { Server } from "@hapi/hapi";

export default class Mongo {
  name: string = "mongoose-schemas";

  register = (server: Server, options: any) => {
    mongoose.model("AuthAttempt", AuthAttempt);
    mongoose.model("GameEvent", GameEvent);
    mongoose.model("Room", Room);
    mongoose.model("Session", Session);
    mongoose.model("User", User);
  };
}
