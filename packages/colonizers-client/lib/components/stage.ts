import $ from "jquery";
import ko from "knockout";
import Stage from "../stage";

ko.bindingHandlers.stageInternal = {
  init: function(element, valueAccessor) {
    var stage = new Stage(element);
    var game = valueAccessor()();

    $(element).data("stage", stage);

    if (game) {
      stage.addGame(game);
    }
  },

  update: function(element, valueAccessor) {
    var stage = $(element).data("stage");
    var game = valueAccessor()();

    if (stage) {
      stage.removeGame();
      if (game) {
        stage.addGame(game);
      }
    }
  }
};

export default {
  template: '<div class="canvas-konva" data-bind="stageInternal: game"></div>'
};
