/**
 * @module nominal/permutation
 */
import {Identifier} from "./identifier";


/**
 * A permutation is an action on identifiers.
 */
export interface Permutation{
    act(ident: Identifier): Identifier;
    invAct(ident: Identifier): Identifier;
}

/**
 * Swap is the permutation we will need to calculate alpha equivalence. The swap
 * that swaps the names a and b is written (a b) and acts on all shift levels,
 * so a'' = (a, 2) gets sent to b'' = (b, 2) etc.
 */
export class Swap implements Permutation{
    left: string;
    right: string;

    act(ident: Identifier): Identifier{
        switch(ident.base){
            case this.left: return ident.rename(this.right);
            case this.right: return ident.rename(this.left);
            default: return ident;
        }
    }

    invAct(ident: Identifier): Identifier{
        return this.act(ident);
    }
}

/**
 * Shift is the permutation that is used to ensure freshness. If we want to
 * ensure that a is fresh for some expression S we shift the name a to a' so.
 * This shifts the entire column sender (a, n) -> (a, n+1).
 */
export class Shift{
    name: string;
    amount: number;

    act(ident: Identifier): Identifier {
        if(ident.base == this.name)
            ident.shiftBy(this.amount);

        return ident;
    }

    invAct(ident: Identifier): Identifier {
        if(ident.base == this.name)
            ident.shiftBy(-this.amount);

        return ident;
    }
}