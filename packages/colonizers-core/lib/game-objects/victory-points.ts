export class VictoryPoints {
  public: number;

  actual: number;

  constructor(factory) {
    factory.defineProperties(this, {
      public: 0,
      actual: 0
    });
  }
}
