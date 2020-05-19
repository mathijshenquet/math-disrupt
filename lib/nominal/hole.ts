import { Set, Map, is, ValueObject, hash } from "immutable";
import { Bind, Form, Term } from "./term";
import { NominalSet, Permutation } from "./permutation";
import { Name } from "./name";
import { Cursor, CursorChange, Movement } from "../navigate/cursor";
import { NavigableLeaf } from "../navigate/navigable";
import { Template } from "../presentation/template";
import { Builder } from "../presentation/builder";
import { CofiniteSet } from "./support";

/**
 * Shift is the permutation that is used to ensure freshness. If we want to
 * ensure that a is fresh for some expression S we shift the name a to a' so.
 * This shifts the entire column sender (a, n) -> (a, n+1).
 *
export class Shift {
    readonly name: string;
    readonly amount: number = 1;

    constructor(name: string, amount?: number){
        this.name = name;
        if(amount) this.amount = amount;
    }

    freshen(name: Identifier): Identifier {
        if(name.base == this.name)
            name.shiftBy(this.amount);

        //TODO

        return name;
    }
}
*/

export class Hole implements NavigableLeaf, ValueObject, NominalSet {
  sort: string;
  name: string;
  pmss: CofiniteSet;

  tree: "leaf" = "leaf";
  template: Template;

  equals(other: this): boolean {
    return (
      this.name == other.name &&
      is(this.pmss, other.pmss) &&
      is(this.sort, other.sort)
    );
  }

  hashCode(): number {
    return hash(this.name) + hash(this.pmss) + hash(this.sort);
  }

  constructor(name: string, sort: string) {
    this.pmss = new CofiniteSet();
    this.sort = sort;
    this.name = name;
    this.template = [Builder.ord(name.toUpperCase())];
  }

  // Navigable
  enter(movement: Movement): Cursor {
    throw new Error("Method not implemented.");
  }

  step(pos: number, movement: Movement): CursorChange {
    throw new Error("Method not implemented.");
  }

  /// NominalSet
  act(perm: Permutation): Hole {
    return this;
  }
}

/**
 * Computes the unknowns of a term
 */
export function unknowns(term: Term): Set<Hole> {
  if (term instanceof Name) return Set();
  else if (term instanceof Hole) return Set([term]);
  else if (term instanceof Form) return unknowns(term.parts);
  else if (term instanceof Array)
    return term.reduce(
      (collection, item) => collection.union(unknowns(item)),
      Set<Hole>()
    );
  else if (term instanceof Bind) return unknowns(term.term);
  else throw new Error("Unreachable in #unknowns");
}
