/**
 * @module nominal/permutation
 */
import {Identifier} from "./identifier";

/**
 * A permutation is an action on identifiers.
 */
export interface Permutation{
    apply(ident: Identifier): Identifier;
}

/**
 * Swap is the permutation we will need to calculate alpha equivalence. The swap
 * that swaps the names a and b is written (a b) and acts on all shift levels,
 * so a'' = (a, 2) gets sent to b'' = (b, 2) etc.
 */
export class Swap implements Permutation {
    left: Identifier;
    right: Identifier;

    apply(ident: Identifier): Identifier{
        let left = this.left, right = this.right;

        let source, target;
        switch(ident.base){
            case this.left.base:
                source = left;
                target = right;
                break;

            case this.right.base:
                source = right;
                target = left;
                break;

            default:
                return ident;
        }

        if(ident.shift == source.shift) return target; // swap
        if(ident.shift > source.shift) return ident.shiftBy(-1); // shift down

        return ident; // do nothing
    }
}

/**
 * Shift is the permutation that is used to ensure freshness. If we want to
 * ensure that a is fresh for some expression S we shift the name a to a' so.
 * This shifts the entire column sender (a, n) -> (a, n+1).
 */
export class Shift implements Permutation {
    readonly name: string;
    readonly amount: number = 1;

    constructor(name: string, amount?: number){
        this.name = name;
        if(amount) this.amount = amount;
    }

    apply(ident: Identifier): Identifier {
        if(ident.base == this.name)
            ident.shiftBy(this.amount);

        return ident;
    }

    inverse(): Permutation {
        return new Shift(this.name, -this.amount);
    }
}

/**
 * Compose permutations
 */
export class PermutationList implements Permutation {
    atoms: Array<Permutation>;

    constructor(...atoms: Array<Permutation>){
        this.atoms = atoms;
    }

    apply(ident: Identifier): Identifier {
        return this.atoms.reduce(
            (ident: Identifier, perm: Permutation) => perm.apply(ident),
            ident);
    }

    inverse(): Permutation {
        return new PermutationList(...this.atoms.reverse().map((perm) => perm.inverse()));
    }
}


/**
 * This object has an action by permutations
 */
export interface PermutationAction {
    act(perm: Permutation): this;
}