import QueryableCollection from "./queryable-collection";
import clauses from "./query-clauses";

class HexCornerCollection extends QueryableCollection {
  constructor() {
    super([
      clauses.owner,
      clauses.within,
      clauses.exclude,
      clauses.buildable,
      clauses.settlement,
      clauses.city
    ]);
  }
}

class HexEdgeCollection extends QueryableCollection {
  constructor() {
    super([clauses.owner, clauses.within, clauses.exclude, clauses.buildable]);
  }
}

class HexTileCollection extends QueryableCollection {
  constructor() {
    super([clauses.owner, clauses.within, clauses.exclude, clauses.buildable]);
  }
}

export { HexCornerCollection, HexEdgeCollection, HexTileCollection };
