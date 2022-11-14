import { Server } from "@hapi/hapi";

export default class Assets {
  name: string = "assets";

  register = (server: Server, options: any) => {
    server.route({
      method: "GET",
      path: "/bundles/{param*}",
      options: {
        auth: false
      },
      handler: {
        directory: {
          path: ["./dist"]
        }
      }
    });

    server.route({
      method: "GET",
      path: "/css/{param*}",
      options: {
        auth: false
      },
      handler: {
        directory: {
          path: ["./server/assets/css", "../colonizers-client/public/css"]
        }
      }
    });

    server.route({
      method: "GET",
      path: "/fonts/{param*}",
      options: {
        auth: false
      },
      handler: {
        directory: {
          path: ["./server/assets/fonts", "../colonizers-client/public/fonts"]
        }
      }
    });

    server.route({
      method: "GET",
      path: "/img/{param*}",
      options: {
        auth: false
      },
      handler: {
        directory: {
          path: ["../colonizers-client/public/img"]
        }
      }
    });

    server.route({
      method: "GET",
      path: "/tilesets/{param*}",
      options: {
        auth: false
      },
      handler: {
        directory: {
          path: ["../colonizers-client/public/tilesets"]
        }
      }
    });

    server.route({
      method: "GET",
      path: "/script/{param*}",
      options: {
        auth: false
      },
      handler: {
        directory: {
          path: ["./server/web/"]
        }
      }
    });
  };
}
