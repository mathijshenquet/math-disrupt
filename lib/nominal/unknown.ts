import {Set, Map} from "immutable";
import {Bind, Form, Name, Term, Tuple, Unknown} from "./terms";
import {Permutation, Shift, Swap} from "./permutation";

/**
 * In its basic form a PermissionSet is the atoms that are allowed to used in
 * some expression. To ensure names are fresh a collection of shifts is
 * remembered (See Shift).
 */
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
}

/**
 * Computes the unknowns of a term
 */
export function unknowns(term: Term): Set<Unknown>{
    if(term instanceof Name) return Set();

    else if(term instanceof Unknown) return Set([term]);

    else if(term instanceof Form) return unknowns(term.argument);

    else if(term instanceof Tuple)
        return term.elements.reduce(
            (collection, item) => collection.union(unknowns(item))
            , Set<Unknown>()
        );

    else if(term instanceof Bind)
        return unknowns(term.term);

    else
        throw new Error("Unreachable in #unknowns");
}