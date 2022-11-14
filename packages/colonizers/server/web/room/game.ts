"use strict";

import $ from "jquery";
import Client from "colonizers-client";
import io from "socket.io-client";
import GameSerializer from "colonizers-core/lib/game-serializer";
import EmitterQueue from "colonizers-core/lib/emitter-queue";
import GameCoordinator from "colonizers-core/lib/game-coordinator";

const Factory = Client.Factory;

$.get("/tilesets/modern.json", function(tileset) {
  var socket = io();
  var emitterQueue = new EmitterQueue(socket);
  var factory = new Factory({
    tileset: tileset
  });
  var gameCoordinator = new GameCoordinator(emitterQueue);

  var client = new Client({
    factory: factory,
    tileset: tileset,
    emitterQueue: emitterQueue,
    clientUsers: [window.context.userId],
    emitEvent: function(playerId, event, data) {
      socket.emit("game-event", {
        roomId: window.context.roomId,
        event: event,
        data: data
      });
    }
  });

  socket.on("room_closed", function() {
    window.location.href = "/lobby";
  });

  socket.on("connect", function() {
    var roomId = window.context.roomId;

    socket.emit("join-game", roomId);

    socket.emit("room-users", { roomId: roomId }, function(users) {
      client.setUsers(users);

      socket.emit("get-game", { roomId: roomId }, function(data) {
        var game = new GameSerializer(factory).deserialize(data);
        emitterQueue.kill();
        gameCoordinator.setGame(game);
        client.setGame(game);
      });
    });
  });
});
