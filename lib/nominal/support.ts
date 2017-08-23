/**
 * @module nominal/support
 */

import {Map, Set} from "immutable";
import {PermutationList, Swap, NominalSet, Permutation} from "./permutation";
import {Name} from "./name";
import {Bind, Form, Term, Composite} from "./term";
import {Hole} from "./hole";

export class FiniteSet implements NominalSet {
    readonly included: Set<Name>;

    constructor(els: Iterable<Name> | Set<Name> = Set()){
        this.included = els instanceof Set ? <Set<Name>>els : Set(els);
    }

    contains(name: Name): boolean{
        return this.included.contains(name);
    }

    isSubset(other: FiniteSet): boolean{
        return this.included.isSubset(other.included);
    }

    union(other: FiniteSet): FiniteSet{
        return new FiniteSet(this.included.union(other.included));
    }

    remove(id: Name): FiniteSet {
        return new FiniteSet(this.included.remove(id));
    }

    add(id: Name): FiniteSet {
        return new FiniteSet(this.included.add(id));
    }

    report(): any {
        return this.included.toJS();
    }


    /// NominalSet
    act(perm: Permutation): FiniteSet {
        return this.map(perm.apply.bind(perm));
    }

    private map(mapper: (value: Name, key: Name, iter: Set<Name>) => Name): FiniteSet {
        return new FiniteSet(Set(this.included.map(mapper)));
    }
}

export class CofiniteSet implements NominalSet {
    readonly excluded: Set<Name>;

    constructor(excluded: Set<Name> = Set()){
        this.excluded = excluded;
    }

    contains(name: Name): boolean{
        return !this.excluded.contains(name);
    }

    isSubset(other: Support): boolean{
        if(other instanceof FiniteSet)
            return other.included.intersect(this.excluded).isEmpty();

        else
            return this.excluded.isSuperset(other.excluded);
    }

    union(other: Support): Support{
        if(other instanceof FiniteSet)
            return new CofiniteSet(this.excluded.subtract(other.included));

        else
            return new CofiniteSet(this.excluded.intersect(other.excluded));
    }

    remove(id: Name): Support {
        return new CofiniteSet(this.excluded.add(id));
    }

    report(): any {
        return this.excluded.toJS();
    }

    /// PermissionSet
    act(perm: Permutation): CofiniteSet {
        return this.map(perm.apply.bind(perm));
    }

    private map(mapper: (value: Name, key: Name, iter: Set<Name>) => Name): CofiniteSet {
        return new CofiniteSet(Set(this.excluded.map(mapper)));
    }
}

export type Support = CofiniteSet | FiniteSet;

export const Support = {
    union(left: Support, right: Support) : Support {
        if(left instanceof CofiniteSet){
            return left.union(right);
        }else if(right instanceof CofiniteSet){
            return right.union(left);
        }else{
            return left.union(right);
        }
    },

    isSubset(sup: Support, sub: Support){
        if(sup instanceof FiniteSet && sub instanceof FiniteSet)
            return sup.isSubset(sub);

        else if(sup instanceof CofiniteSet)
            return sup.isSubset(sub);

        else
            return false;
    },

    empty: new FiniteSet(),

    singleton(id: Name): Support {
        return new FiniteSet([id]);
    }
};

export function support(term: Term): Support{
    if(term instanceof Name)
        return Support.singleton(term);

    else if(term instanceof Hole)
        return term.pmss;

    else if(term instanceof Form)
        return support(term.parts);

    else if(term instanceof Composite)
        return term.elements.map(support).reduce(Support.union, Support.empty);

    else if(term instanceof Bind) {
        if(term.name instanceof Hole)
            throw new Error("Cannot determine support for term with unknown names");
        return support(term.term).remove(term.name);
    }

    else
        throw new Error("Unreachable in #support");
}