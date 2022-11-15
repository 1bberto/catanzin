import Boom from "@hapi/boom";
import Hoek from "hoek";
import mongoose from "mongoose";
import { Server, Request, ResponseToolkit } from "@hapi/hapi";

export default class SessionsApi {
  name: string = "api/sessions";

  register(server: Server, options) {
    options = Hoek.applyToDefaults({ basePath: "" }, options);

    server.route({
      method: "GET",
      path: options.basePath + "/account/sessions",
      options: {
        description: "Returns a list of sessions for the current user.",
        auth: {
          strategy: "cookie"
        }
      },
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        var Session = mongoose.model("Session");

        var criteria = { user: request.auth.credentials.userId };
        Session.find(criteria)
          .sort("-lastActive")
          .exec(function(err, user) {
            if (err) {
              return new Boom.Boom(err);
            }

            return user;
          });
      }
    });

    server.route({
      method: "GET",
      path: options.basePath + "/account/sessions/{sessionId}",
      options: {
        description: "Returns a single session, specified by ID.",
        auth: {
          strategy: "cookie"
        },
        validate: {
          params: {
            sessionId: (server.plugins as any).validations.mongoId
              .required()
              .description("Session ID")
          }
        }
      },
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        var Session = mongoose.model("Session");

        var criteria = {
          _id: request.params.sessionId,
          user: request.auth.credentials.userId
        };

        Session.findOne(criteria, function(err, session) {
          if (err) {
            return reply.response(new Boom.Boom(err));
          }

          if (!session) {
            return reply.response(Boom.notFound());
          }

          return reply.response(session);
        });
      }
    });

    server.route({
      method: "DELETE",
      path: options.basePath + "/account/sessions/{sessionId}",
      options: {
        description: "Deletes a single session, specified by ID.",
        auth: {
          strategy: "cookie"
        },
        validate: {
          params: {
            sessionId: (server.plugins as any).validations.mongoId
              .required()
              .description("Session ID")
          }
        }
      },
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        var Session = mongoose.model("Session");

        var criteria = {
          _id: request.params.sessionId,
          user: request.auth.credentials.userId
        };

        Session.remove(criteria, (err): any => {
          if (err) {
            return reply.response(new Boom.Boom(err));
          }

          return reply.response();
        });
      }
    });
  }
}
