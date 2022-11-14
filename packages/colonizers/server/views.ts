import * as Hapi from "@hapi/hapi";

export default function(server: Hapi.Server, isProd: boolean) {
  server.views({
    relativeTo: __dirname,
    path: "./web",
    layout: true,
    layoutPath: "./web",

    engines: {
      html: require("handlebars")
    }
  });
}
