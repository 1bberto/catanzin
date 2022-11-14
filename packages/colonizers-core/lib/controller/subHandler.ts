import async from "async";

export default class SubHandler {
  condition: any;

  thens: any;

  constructor(condition) {
    this.condition = condition;
    this.handle = this.handle.bind(this);
  }

  then(...args) {
    this.thens = Array.prototype.slice.call(args, 0);
  }

  handle(req, cb) {
    var yep = !this.condition || this.condition(req);

    if (!yep) {
      return false;
    }

    var thens = this.thens.map(function(func) {
      return function(next) {
        func(req, next);
      };
    });

    async.waterfall(thens, function(err) {
      if (err) {
        req.error(err);
        return cb();
      }

      req.done();
      cb();
    });

    return true;
  }
}
