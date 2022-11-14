import SubHandler from "./subHandler";

export default class Handler {
  subs: Array<any>;

  constructor() {
    this.subs = [];
    this.handle = this.handle.bind(this);
  }

  if() {
    var sub = new SubHandler(Array.prototype.slice.call(arguments, 0));
    this.subs.push(sub);
    return sub;
  }

  handle(req, next) {
    var handled = this.subs.some(function(sub) {
      return sub.handle(req, next);
    });

    if (!handled) {
      req.error("Unhandled");
      next();
    }
  }
}
