import mongoose from "mongoose";

function register(server, options, next) {
  server.route({
    method: "GET",
    path: "/account",
    handler: function(request, reply) {
      var User = mongoose.model("User");

      User.findById(request.auth.credentials.userId, function(err, user) {
        if (err) {
          return reply(err);
        }

        reply.view("account/index", {
          user: user,
          script: "account/public"
        });
      });
    }
  });

  next();
}

register.attributes = {
  name: "web/account"
};

export default {
  register
};
