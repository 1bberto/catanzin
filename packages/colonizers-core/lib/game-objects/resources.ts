export class Resources {
  total: number;

  brick: number;

  grain: number;

  lumber: number;

  ore: number;

  wool: number;

  constructor(factory) {
    factory.defineProperties(this, {
      total: 0,
      brick: 0,
      grain: 0,
      lumber: 0,
      ore: 0,
      wool: 0
    });
  }
}
