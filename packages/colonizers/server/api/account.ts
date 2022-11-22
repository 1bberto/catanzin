import Hoek from "hoek";
import mongoose from "mongoose";
import { Server, Request, ResponseToolkit } from "@hapi/hapi";
import Joi from "joi";

export default class AccountApi {
  name: string = "api/account";

  register(server: Server, options) {
    options = Hoek.applyToDefaults({ basePath: "" }, options);

    server.route({
      method: "GET",
      path: options.basePath + "/account",
      options: {
        description: "Returns the account information for the current user.",
        // plugins: {
        //   "hapi-io": true
        // },
        auth: {
          strategy: "cookie"
        }
      },
      handler: async (request: Request, toolkit: ResponseToolkit) => {
        var User = mongoose.model("User");

        User.findById(request.auth.credentials.userId, function(err, user) {
          if (err) {
            return toolkit.response(err);
          }

          return toolkit.response(user);
        });
      }
    });

    server.route({
      method: "PUT",
      path: options.basePath + "/account",
      options: {
        description: "Updates the account information for the current user.",
        auth: {
          strategy: "cookie"
        },
        validate: {
          payload: Joi.object().keys({
            username: Joi.string()
              .required()
              .description("Username"),
            name: Joi.string()
              .required()
              .description("Name"),
            email: Joi.string()
              .email()
              .required()
              .description("Email"),
            password: Joi.string()
              .optional()
              .allow("")
              .description("Password"),
            password2: Joi.string()
              .optional()
              .allow(""),
            artifact: Joi.string()
              .optional()
              .allow("")
          })
        }
      },
      handler: async (request: Request, toolkit: ResponseToolkit) => {
        var User = mongoose.model("User");

        User.findById(request.auth.credentials.userId, function(err, user) {
          if (err) {
            return toolkit.response(err);
          }
          const { username, name, email, password } = request.payload as any;

          user.set("username", username);
          user.set("name", name);
          user.set("email", email);

          if (password) {
            user.setPassword(password);
          }

          user.save(function(err2) {
            if (err2) {
              return toolkit.response(err2);
            }

            toolkit.response(user);
          });
        });
      }
    });
  }
}
