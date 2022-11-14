import Joi from "@hapi/joi";
import Boom from "@hapi/boom";
import mongoose from "mongoose";
import { Server, Request, ResponseToolkit } from "@hapi/hapi";

export default class LoginPage {
  name: string = "web/login";

  register = (server: Server, options: any) => {
    server.route({
      method: "GET",
      path: "/logout",
      options: {
        auth: false
      },
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        var Session = mongoose.model("Session");
        var credentials = request.auth.credentials || { session: {} };
        var session: any = credentials.session || {};

        Session.findByIdAndRemove(session._id, function(err) {
          if (err) {
            return reply.response(new Boom.Boom(err));
          }

          request.cookieAuth.clear();
          reply.redirect("/");
        });
      }
    });

    server.route({
      method: "GET",
      path: "/login",
      options: {
        auth: {
          mode: "try",
          strategy: "cookie"
        }
        // plugins: {
        //   "hapi-auth-cookie": {
        //     redirectTo: false
        //   }
        // }
      },
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        if (request.auth.isAuthenticated) {
          return reply.redirect("/lobby");
        }

        return reply
          .view("login/index", {
            script: "login/public"
          })
          .header("x-auth-required", "true");
      }
    });

    server.route({
      method: "POST",
      path: "/login",
      options: {
        // validate: {
        //   payload: {
        //     username: Joi.string()
        //       .lowercase()
        //       .required(),
        //     password: Joi.string().required()
        //   }
        // },
        // plugins: {
        //   "hapi-auth-cookie": {
        //     redirectTo: false
        //   }
        // },
        auth: {
          mode: "try",
          strategy: "cookie"
        },
        pre: [
          {
            assign: "abuseDetected",
            method: (request: Request, reply: ResponseToolkit): any => {
              var AuthAttempt = mongoose.model("AuthAttempt");
              var ip = request.info.remoteAddress;
              var username = (request.payload as any).username;

              (AuthAttempt as any).abuseDetected(ip, username, function(
                err,
                detected
              ) {
                if (err) {
                  return reply.response(new Boom.Boom(err));
                }

                if (detected) {
                  return reply.response(
                    Boom.badRequest(
                      "Maximum number of auth attempts reached. Please try again later."
                    )
                  );
                }

                return reply.response();
              });
            }
          },
          {
            assign: "user",
            method: (request: Request, reply: ResponseToolkit): any => {
              var User = mongoose.model("User");
              const { username, password } = request.payload as any;

              (User as any).authenticate(username, password, function(
                err,
                user
              ) {
                if (err) {
                  return reply.response(new Boom.Boom(err));
                }

                return reply.response(user);
              });
            }
          },
          {
            assign: "logAttempt",
            method: (request: Request, reply: ResponseToolkit): any => {
              if (request.pre.user) {
                return reply.response();
              }

              var AuthAttempt = mongoose.model("AuthAttempt");
              var ip = request.info.remoteAddress;
              const { username } = request.payload as any;

              AuthAttempt.create({ ip: ip, username: username }, function(err) {
                if (err) {
                  return reply.response(new Boom.Boom(err));
                }

                return reply.response(
                  Boom.badRequest(
                    "Username and password combination not found or account is inactive"
                  )
                );
              });
            }
          },
          {
            assign: "session",
            method: (request: Request, reply: ResponseToolkit): any => {
              var Session = mongoose.model("Session");

              Session.create(
                {
                  user: request.pre.user._id
                },
                function(err, session) {
                  if (err) {
                    return reply.response(new Boom.Boom(err));
                  }

                  return reply.response(session);
                }
              );
            }
          }
        ]
      },
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        var result = request.pre.session.toSession();

        request.cookieAuth.set(result);

        return reply.response(result);
      }
    });

    server.route({
      method: "POST",
      path: "/signup",
      options: {
        // plugins: {
        //   "hapi-auth-cookie": {
        //     redirectTo: false
        //   }
        // },
        auth: {
          mode: "try",
          strategy: "cookie"
        },
        // validate: {
        //   payload: {
        //     name: Joi.string().required(),
        //     email: Joi.string()
        //       .email()
        //       .lowercase()
        //       .required(),
        //     username: Joi.string()
        //       .token()
        //       .lowercase()
        //       .required(),
        //     password: Joi.string().required()
        //   }
        // },
        pre: [
          {
            assign: "usernameCheck",
            method: (request: Request, reply: ResponseToolkit): any => {
              var User = mongoose.model("User");

              var conditions = {
                username: (request.payload as any).username
              };

              const response = User.findOne(conditions, function(err, user) {
                if (err) {
                  return reply.response(new Boom.Boom(err));
                }

                if (user) {
                  var response = {
                    message: "Username already in use."
                  };

                  return reply.response(
                    Boom.conflict("Username already in use.", response)
                  );
                }

                return reply.response({ username: true });
              });

              return reply.response(response);
            }
          },
          {
            assign: "emailCheck",
            method: (request: Request, reply: ResponseToolkit): any => {
              var User = mongoose.model("User");
              var conditions = {
                email: (request.payload as any).email
              };

              User.findOne(conditions, function(err, user) {
                if (err) {
                  return reply.response(new Boom.Boom(err));
                }

                if (user) {
                  var response = {
                    message: "Email already in use."
                  };

                  return reply.response(
                    Boom.conflict("Email already in use.", response)
                  );
                }

                return reply.response({ emailCheck: true });
              });
            }
          },
          {
            assign: "user",
            method: (request: Request, reply: ResponseToolkit): any => {
              var User = mongoose.model("User");

              const {
                username,
                email,
                name,
                password
              } = request.payload as any;

              var user = new User({
                username: username,
                email: email,
                name: name,
                password: password
              });

              user.save(function(err) {
                if (err) {
                  return reply.response(new Boom.Boom(err));
                }

                return reply.response(user);
              });
            }
          },
          {
            assign: "session",
            method: (request: Request, reply: ResponseToolkit): any => {
              var Session = mongoose.model("Session");
              Session.create(
                {
                  user: request.pre.user._id
                },
                reply.response
              );
            }
          }
        ]
      },
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        var result = request.pre.session.toSession();

        request.cookieAuth.set(result);

        return reply.response(result);
      }
    });
  };
}
