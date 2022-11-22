import hapiIO from "hapi-io";
import hapiIOpkg from "hapi-io/package.json";
import { Server } from "@hapi/hapi";

export default class HapiIO {
  name: string = "hapi-io";

  pkg: typeof hapiIOpkg;

  register(server: Server, options) {
    server["connections"] = [
      {
        listener: server.listener
      }
    ];

    // TODO FIX ISSUE WITH THE LIB HAPI-IO TO WORK WITH HAPI v20>
    hapiIO.register(server, options, () => {});
  }
}
