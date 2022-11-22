import { Server, Request, ResponseToolkit } from "@hapi/hapi";

export default class ContextCredentials {
  name: string = "hapi-context-credentials";

  register(server: Server, options) {
    server.ext("onPreResponse", function(request: any, reply: ResponseToolkit) {
      var response = request.response;
      if (response.variety && response.variety === "view") {
        response.source.context = response.source.context || {};
        response.source.context.credentials = request.auth.isAuthenticated
          ? request.auth.credentials
          : null;
      }
      return reply.continue;
    });
  }
}
