import * as Hapi from "@hapi/hapi";
import Logger from "./helper/logger";
import views from "./views";
import schema from "./schema";
import inert from "@hapi/inert";
import vision from "@hapi/vision";
import good from "@hapi/good";
import AccountApi from "./api/account";
import cookieAuth from "@hapi/cookie";
import basicAuth from "@hapi/basic";
import Auth from "./auth";
import Validations from "./validations";
import PubSub from "./pubsub";
import HapiIO from "./hapi-io";
import ContextCredentials from "./context-credentials";
import GamesApi from "./api/games";
import RoomsApi from "./api/rooms";
import SessionsApi from "./api/sessions";
import LoginPage from "./web/login";
import IndexPage from "./web";
import Assets from "./assets";
import Mongoose from "./mongoose";
import Joi from "joi";
import LobbyPage from "./web/lobby";

export default class Server {
  private static _instance: Hapi.Server;

  public static async start(): Promise<Hapi.Server> {
    try {
      Server._instance = new Hapi.Server({
        host: process.env.COLONIZERS_HOST || process.env.HOST || "localhost",
        port: process.env.COLONIZERS_PORT || process.env.PORT || 8080
      });

      await Server._instance.validator(Joi);

      await Server._instance.register(inert);

      await Server._instance.register(vision);

      await Server._instance.register([
        {
          name: "good",
          pkg: good,
          register: (server: Server, options: any) => {
            options = {
              ops: {
                interval: 1000
              },
              reporters: {
                console: [
                  {
                    module: "good-console"
                  }
                ]
              }
            };
          }
        }
      ]);

      await Server._instance.register([new schema()]);

      // mongoose
      await Server._instance.register([
        {
          plugin: new Mongoose(),
          options: {
            mongodbUrl:
              process.env.COLONIZERS_MONGO_URL ||
              process.env.MONGOLAB_URI ||
              process.env.MONGOHQ_URL ||
              "mongodb://localhost/catanzin"
          }
        }
      ]);

      await Server._instance.register(basicAuth);

      await Server._instance.register(cookieAuth);

      // auth
      await Server._instance.register([new Auth()]);

      // validations
      await Server._instance.register([new Validations()]);

      await Server._instance.register([
        {
          plugin: new HapiIO(),
          options: {
            auth: {
              strategies: ["cookie"]
            },
            socketio: { serveClient: false }
          }
        }
      ]);

      await Server._instance.register([
        {
          plugin: new PubSub(),
          options: {
            connection: {
              url:
                process.env.COLONIZERS_RABBITMQ_URL ||
                process.env.CLOUDAMQP_URL ||
                process.env.RABBITMQ_BIGWIG_URL
            },
            queue: process.env.COLONIZERS_RABBITMQ_QUEUE
          }
        }
      ]);

      await Server._instance.register([new ContextCredentials()]);

      // api/account
      await Server._instance.register([
        {
          plugin: new AccountApi(),
          options: {
            basePath: "/api"
          }
        }
      ]);

      // api/sessions
      await Server._instance.register([
        {
          plugin: new SessionsApi(),
          options: {
            basePath: "/api"
          }
        }
      ]);

      // api/rooms
      await Server._instance.register([
        {
          plugin: new RoomsApi(),
          options: {
            basePath: "/api"
          }
        }
      ]);

      // api/games
      await Server._instance.register([
        {
          plugin: new GamesApi(),
          options: {
            basePath: "/api"
          }
        }
      ]);

      // IndexPage
      await Server._instance.register([
        {
          plugin: new IndexPage()
        }
      ]);

      // LoginPage
      await Server._instance.register([
        {
          plugin: new LoginPage()
        }
      ]);

      // Lobby
      await Server._instance.register([
        {
          plugin: new LobbyPage()
        }
      ]);

      // Assets
      await Server._instance.register([
        {
          plugin: new Assets()
        }
      ]);

      //   await Server._instance.register([
      //     {
      //       plugin: require("lout"),
      //       options: {
      //         filterRoutes: function(route) {
      //           return route.path.indexOf("/api") === 0;
      //         }
      //       }
      //     }
      //   ]);

      var isProd = process.env.NODE_ENV === "production";

      views(Server._instance, isProd);

      Server._instance.events.on("request", (request, event) => {
        console.log(`Event: ${JSON.stringify(event)}`);
      });

      Server._instance.events.on("response", (request: any) => {
        console.log(`Response Status Code: ${request.response.statusCode}`);
      });

      await Server._instance.start();

      Logger.info(
        `Server - Up and running at http://${Server._instance.settings.host}:${Server._instance.settings.port}`
      );

      return Server._instance;
    } catch (error) {
      Logger.info(`Server - There was something wrong: ${error}`);

      throw error;
    }
  }

  public static stop(): Promise<Error | void> {
    Logger.info(`Server - Stopping execution`);

    return Server._instance.stop();
  }

  public static async recycle(): Promise<Hapi.Server> {
    Logger.info(`Server - Recycling instance`);

    await Server.stop();

    return await Server.start();
  }

  public static instance(): Hapi.Server {
    return Server._instance;
  }

  public static async inject(
    options: string | Hapi.ServerInjectOptions
  ): Promise<Hapi.ServerInjectResponse> {
    return await Server._instance.inject(options);
  }
}
