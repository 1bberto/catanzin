var mongoose = require("mongoose");
import { Server, Request, ResponseToolkit, AuthCredentials } from "@hapi/hapi";
import { ValidateResponse } from "@hapi/cookie";
export default class Auth {
  name: string = "auth";

  register = function(server: Server, options) {
    var findSession = async function(criteria): Promise<ValidateResponse> {
      var Session = mongoose.model("Session");

      const findResult = new Promise<ValidateResponse>(resolve => {
        Session.findOne(criteria)
          .populate("user")
          .exec(function(err, session) {
            if (err) {
              return resolve({ isValid: true });
            }

            if (!session || !session.user) {
              return resolve({ isValid: true });
            }

            return resolve({
              isValid: true,
              credentials: {
                session: session,
                sessionId: session._id,
                user: session.user,
                userId: session.user._id,
                scope: session.scope
              } as AuthCredentials
            } as ValidateResponse);
          });
      });

      return await findResult;
    };

    server.auth.strategy("cookie", "cookie", {
      cookie: {
        name: "catanzinhu",
        password: "our not soooooo little secret :P",
        isSecure: false
      },
      validate: async (request: Request, session: any) => {
        return await findSession({
          type: "web",
          _id: session.id,
          token: session.token
        });
      },
      redirectTo: "/login"
    });

    server.auth.strategy("basic", "basic", {
      validate: function(request, username, password) {
        return findSession({ _id: username, token: password });
      }
    });

    server.ext("onPostAuth", function(
      request: Request,
      reply: ResponseToolkit
    ): any {
      var session: any =
        request.auth.credentials && request.auth.credentials.session;

      if (!session) {
        return reply.continue;
      }

      session.lastActive = Date.now();

      if (request.info.remoteAddress) {
        session.ipAddress = request.info.remoteAddress;
      }

      if (request.headers["user-agent"]) {
        session.userAgent = request.headers["user-agent"];
      }

      return new Promise(resolve => {
        session.save(function(err) {
          if (err) {
            return resolve(err);
          }

          resolve(reply.continue);
        });
      });
    });

    server.auth.default({
      strategies: ["basic", "cookie"]
    });
  };
}
