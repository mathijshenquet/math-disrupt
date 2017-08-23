
import {hash, ValueObject, Set} from "immutable";
import {Cursor, CursorChange, Movement} from "../navigate/cursor";
import {Navigable, NavigableLeaf} from "../navigate/navigable";
import {Support} from "./support";
import {NominalSet, Permutation} from "./permutation";

export function N(name: string, shift: number = 0){
    return new Name(name, shift);
}

/**
 * To ensure names are always freshly pickable each name has an associated shift
 * for example if x is already bound in some expression X, then if we want to
 * bind x again, the x already bound in X will get shifted one spot which we
 * will write as x'. To make these shifts well behaved (invertible) we also
 * allow negative shift levels.
 */
export class Name implements ValueObject, NavigableLeaf, NominalSet {
    readonly base: string;
    readonly shift: number;
    readonly tree: "leaf" = "leaf";
    readonly sort: "identifier" = "identifier";

    constructor(name: string, shift: number){
        this.base = name;
        this.shift = shift;
    }

    inComb(): boolean{
        return this.shift <= 0;
    }

    rename(name: string): Name {
        return N(name, this.shift);
    }

    shiftBy(amount: number): Name {
        return N(this.base, this.shift + amount);
    }

    toString(){
        return this.base + "'".repeat(this.shift);
    }

    /// Navigable
    enter(movement: Movement): Cursor {
        return new Cursor(this.base.length * (1 - movement)/2);
    }

    step(pos: number, movement: Movement): CursorChange {
        return Cursor.boundedChange(pos + movement, this.base.length);
    }

    /// ValueObject
    equals(other: Name): boolean {
        return this.base === other.base && this.shift === other.shift;
    }

    hashCode(): number {
        return hash(this.base) ^ hash(this.shift);
    }

    /// NominalSet
    act(perm: Permutation): Name {
        return perm.apply(this);
    }
}