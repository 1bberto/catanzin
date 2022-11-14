import { Server, Request, ResponseToolkit } from "@hapi/hapi";

export default class IndexPage {
  name: string = "web/index";

  register = (server: Server, options: any) => {
    server.route({
      method: "GET",
      path: "/",
      options: {
        auth: false
      },
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        if (request.auth.isAuthenticated) {
          return reply.redirect("/lobby");
        }

        return reply.redirect("/login");
      }
    });
  };
}
