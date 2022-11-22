import * as Hapi from "@hapi/hapi";
import Handlebars from "handlebars";

export default function(server: Hapi.Server, isProd: boolean) {
  Handlebars.registerHelper("json", function(obj) {
    return new Handlebars.SafeString(JSON.stringify(obj));
  });

  Handlebars.registerHelper("isoFormat", function(date) {
    return date ? date.toISOString() : "";
  });

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
