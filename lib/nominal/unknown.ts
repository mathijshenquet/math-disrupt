import {Set, Map} from "immutable";
import {Bind, Form, Term, Composite} from "./term";
import {PermutationList, Shift, Swap} from "./permutation";
import {Identifier} from "./identifier";
import {Cursor, CursorChange, Movement} from "./cursor";
import {Sort} from "./signature";
import {NavigableLeaf} from "./navigable";
import {Template} from "../presentation/template";
import {Builder} from "../presentation/builder";
import {PermissionSet} from "./support";

/**
 * In its basic form a PermissionSet is the atoms that are allowed to used in
 * some expression. To ensure names are fresh a collection of shifts is
 * remembered (See Shift).
export class PermissionSet{
    readonly shifts: Map<string, number>;

    constructor(shifts: Map<string, number> = Map()){
        this.shifts = shifts;
    }

    permute(perm: Permutation) {
        let shifts = this.shifts;
        if (perm instanceof Shift) {
            shifts = shifts.update(perm.name, 0,
                (shift: number): number => shift + perm.amount);

        }else if(perm instanceof Swap){
            let leftShift = shifts.get(perm.left, 0);
            let rightShift = shifts.get(perm.right, 0);

            shifts = shifts.set(perm.left, rightShift)
                .set(perm.right, leftShift);
        }

        return new PermissionSet(shifts);
    }
}*/

export class Unknown implements NavigableLeaf {
    sort: Sort;
    pms: PermissionSet;
    name: string;
    tree: "leaf" = "leaf";
    template: Template = [Builder.ord(this.name.toUpperCase())];

    constructor(name: string, sort: Sort){
        this.pms = new PermissionSet();
        this.sort = sort;
        this.name = name;
    }

    // Navigable
    enter(movement: Movement): Cursor {
        throw new Error("Method not implemented.");
    }

    step(pos: number, movement: Movement): CursorChange {
        throw new Error("Method not implemented.");
    }
}

/**
 * Computes the unknowns of a term
 */
export function unknowns(term: Term): Set<Unknown>{
    if(term instanceof Identifier) return Set();

    else if(term instanceof Unknown) return Set([term]);

    else if(term instanceof Form) return unknowns(term.argument);

    else if(term instanceof Array)
        return term.reduce(
            (collection, item) => collection.union(unknowns(item))
            , Set<Unknown>()
        );

    else if(term instanceof Bind)
        return unknowns(term.term);

    else
        throw new Error("Unreachable in #unknowns");
}