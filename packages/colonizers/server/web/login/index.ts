import Joi from "joi";
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

        return new Promise(resolve => {
          Session.findByIdAndRemove(session._id, function(err) {
            if (err) {
              return resolve(new Boom.Boom(err));
            }

            request.cookieAuth.clear();

            resolve(reply.redirect("/"));
          });
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
        validate: {
          payload: Joi.object().keys({
            username: Joi.string()
              .lowercase()
              .required(),
            password: Joi.string().required()
          })
        },
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
            method: async (
              request: Request,
              reply: ResponseToolkit
            ): Promise<any> => {
              var AuthAttempt = mongoose.model("AuthAttempt");
              var ip = request.info.remoteAddress;
              var username = (request.payload as any).username;

              return new Promise(resolve => {
                (AuthAttempt as any).abuseDetected(ip, username, function(
                  err,
                  detected
                ) {
                  if (err) {
                    resolve(new Boom.Boom(err));
                  }

                  if (detected) {
                    resolve(
                      Boom.badRequest(
                        "Maximum number of auth attempts reached. Please try again later."
                      )
                    );
                  }

                  resolve(reply.continue);
                });
              });
            }
          },
          {
            assign: "user",
            method: (request: Request, reply: ResponseToolkit): any => {
              var User = mongoose.model("User");
              const { username, password } = request.payload as any;

              return new Promise(resolve => {
                (User as any).authenticate(username, password, function(
                  err,
                  user
                ) {
                  if (err) {
                    return resolve(new Boom.Boom(err));
                  }

                  return resolve(user);
                });
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

              return new Promise(resolve => {
                AuthAttempt.create({ ip: ip, username: username }, function(
                  err
                ) {
                  if (err) {
                    return resolve(new Boom.Boom(err));
                  }

                  return resolve(
                    Boom.badRequest(
                      "Username and password combination not found or account is inactive"
                    )
                  );
                });
              });
            }
          },
          {
            assign: "session",
            method: (request: Request, reply: ResponseToolkit): any => {
              var Session = mongoose.model("Session");

              return new Promise(resolve => {
                Session.create(
                  {
                    user: request.pre.user._id
                  },
                  function(err, session) {
                    if (err) {
                      return resolve(new Boom.Boom(err));
                    }

                    return resolve(session);
                  }
                );
              });
            }
          }
        ]
      },
      handler: (request: Request, reply: ResponseToolkit, err?: Error): any => {
        const result = request.pre.session.toSession();

        request.cookieAuth.set(result);

        return reply.redirect("/");
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
        validate: {
          payload: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string()
              .email()
              .lowercase()
              .required(),
            username: Joi.string()
              .token()
              .lowercase()
              .required(),
            password: Joi.string().required()
          })
        },
        pre: [
          {
            assign: "usernameCheck",
            method: (request: Request, reply: ResponseToolkit): any => {
              var User = mongoose.model("User");

              var conditions = {
                username: (request.payload as any).username
              };

              return new Promise(resolve => {
                User.findOne(conditions, function(err, user) {
                  if (err) {
                    return resolve(new Boom.Boom(err));
                  }

                  if (user) {
                    var response = {
                      message: "Username already in use."
                    };

                    return resolve(
                      Boom.conflict("Username already in use.", response)
                    );
                  }

                  return resolve({ username: true });
                });
              });
            }
          },
          {
            assign: "emailCheck",
            method: (request: Request, reply: ResponseToolkit): any => {
              var User = mongoose.model("User");
              var conditions = {
                email: (request.payload as any).email
              };

              return new Promise(resolve => {
                User.findOne(conditions, function(err, user) {
                  if (err) {
                    return resolve(new Boom.Boom(err));
                  }

                  if (user) {
                    var response = {
                      message: "Email already in use."
                    };

                    return resolve(
                      Boom.conflict("Email already in use.", response)
                    );
                  }

                  return resolve({ emailCheck: true });
                });
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

              return new Promise(resolve => {
                user.save(function(err) {
                  if (err) {
                    return resolve(new Boom.Boom(err));
                  }

                  return resolve(user);
                });
              });
            }
          },
          {
            assign: "session",
            method: (request: Request, reply: ResponseToolkit): any => {
              var Session = mongoose.model("Session");

              return Session.create(
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
