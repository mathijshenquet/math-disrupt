/**
 * @module nominal/permutation
 */
import {Name} from "./name";
import {is} from "immutable";

/**
 * A permutation is an action on identifiers.
 */
export interface Permutation{
    apply(name: Name): Name;
    inverseApply(name: Name): Name;
}

/**
 * Swap is the permutation we will need to calculate alpha equivalence. The swap
 * that swaps the names a and b is written (a b) and acts on all shift levels,
 * so a'' = (a, 2) gets sent to b'' = (b, 2) etc.
 */
export class Swap implements Permutation {
    left: Name;
    right: Name;

    constructor(left: Name, right: Name){
        this.left = left; this.right = right;
    }

    apply(name: Name): Name{
        if(is(name, this.left)) return this.right;
        if(is(name, this.right)) return this.left;
        return name;
    }

    inverseApply(name: Name): Name{
        return this.apply(name);
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

    apply(name: Name): Name {
        return this.atoms.reduce((name: Name, perm: Permutation) => perm.apply(name), name);
    }

    inverseApply(name: Name): Name {
        return this.atoms.reduceRight((name: Name, perm: Permutation) => perm.inverseApply(name), name);
    }
}


/**
 * This object has an action by permutations
 */
export interface NominalSet {
    act(perm: Permutation): NominalSet;
}