var mongoose = require("mongoose");
import { Server, Request } from "@hapi/hapi";

export default class Auth {
  name: string = "auth";

  register = function(server: Server, options) {
    var findSession = function(criteria) {
      var Session = mongoose.model("Session");
      Session.findOne(criteria)
        .populate("user")
        .exec(function(err, session) {
          if (err) {
            return { error: err, valid: false };
          }

          if (!session || !session.user) {
            return { error: err, valid: false };
          }

          return {
            valid: true,
            credentials: {
              session: session,
              sessionId: session._id,
              user: session.user,
              userId: session.user._id,
              scope: session.scope
            }
          };
        });
    };

    server.auth.strategy("cookie", "cookie", {
      cookie: {
        name: "sid-example",
        password: "our not soooooo little secret :P",
        isSecure: false
      },
      validate: async (request: Request, session: any) => {
        return findSession({
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

    server.ext("onPostAuth", function(request, reply: any) {
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

      session.save(function(err) {
        if (err) {
          return reply(err);
        }

        reply.continue();
      });
    });

    server.auth.default({
      strategies: ["basic", "cookie"]
    });
  };
}
