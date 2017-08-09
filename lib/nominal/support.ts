/**
 * @module nominal/support
 */

import {Map, Set} from "immutable";
import {PermutationList, Swap, Shift, PermutationAction} from "./permutation";
import {Identifier} from "./identifier";
import {Bind, Form, Term, Composite} from "./term";
import {Unknown} from "./unknown";

export type Support = PermissionSet | FiniteSet;

export const Support = {
    union(left: Support, right: Support) : Support {
        if(left instanceof PermissionSet){
            return left.union(right);
        }else if(right instanceof PermissionSet){
            return right.union(left);
        }else{
            return left.union(right); // use Set union
        }
    },

    isSubset(sup: Support, sub: Support){
        if(sup instanceof Set && sub instanceof Set)
            return (<any>sup).isSubset(sub);

        else if(sup instanceof PermissionSet && sub instanceof PermissionSet)
            return sup.isSubset(sub);

        else
            return false;
    },

    empty: Set<Identifier>(),

    singleton(id: Identifier): Support {
        return new FiniteSet([id]);
    }
};

export class FiniteSet implements PermutationAction {
    readonly elements: Set<Identifier>;

    constructor(els: Iterable<Identifier> | Set<Identifier>){
        this.elements = els instanceof Set ? <Set<Identifier>>els : Set(els);
    }

    contains(ident: Identifier): boolean{
        return this.elements.contains(ident);
    }

    isSubset(other: FiniteSet): boolean{
        return this.elements.isSubset(other.elements);
    }

    union(other: FiniteSet): Support{
        return new FiniteSet(this.elements.union(other.elements));
    }

    remove(id: Identifier): Support {
        return new FiniteSet(this.elements.remove(id));
    }

    report(): any {
        return this.elements.toJS();
    }

    act(perm: PermutationList): FiniteSet {
        if(perm instanceof Swap){
            let left = perm.left, right = perm.right;

            if(this.contains(left) == this.contains(right));

        }else{

        }
    }
}

const maxMerger = (a: number, b: number) => Math.max(a, b);
const subOne = (num: number) => num - 1;

export class PermissionSet{
    // enforce, number >= 0
    readonly bounds: Map<string, number>;

    constructor(bounds: Map<string, number> = Map()){
        this.bounds = bounds;
    }

    getBound(base: string): number{
        return this.bounds.get(base, 0);
    }

    contains(ident: Identifier): boolean{
        return 0 <= ident.shift && ident.shift <= this.getBound(ident.base);
    }

    isSubset(other: PermissionSet): boolean{
        let bounded = (bound: number, base: string) => (bound <= this.getBound(base));
        return other.bounds.every(bounded);
    }

    union(other: Support): Support{
        let updates;
        if(other instanceof PermissionSet)
            updates = other.bounds;

        else
            updates = Map<string, number>(
                other.map((id: Identifier) => [id.base, id.shift])
            );

        return new PermissionSet(this.bounds.mergeWith(maxMerger, updates));
    }

    remove(id: Identifier): Support {
        if(this.contains(id)){
            return new PermissionSet(this.bounds.update(id.base, subOne));
        }else{
            return this;
        }
    }

    report(): any {
        return this.bounds.toJS();
    }
}

export function support(term: Term): Support{
    if(term instanceof Identifier)
        return Support.singleton(term);

    else if(term instanceof Unknown)
        return term.pms;

    else if(term instanceof Form)
        return support(term.argument);

    else if(term instanceof Composite)
        return term.elements.map(support).reduce(Support.union, Support.empty);

    else if(term instanceof Bind)
        return support(term.term).remove(term.name);

    else
        throw new Error("Unreachable in #support");
}

////////////////////////
// OLD
////////////////////////

/*
export class PermissionSet{
    readonly positive: Set<Identifier>;
    readonly negative: Set<Identifier>;

    constructor(positive: Set<Identifier>, negative: Set<Identifier> = Set()){
        this.positive = positive;
        this.negative = negative;
    }

    inInfinitePart(id: Identifier){
        // check if the shift is not too high
        return id.inComb();
    }

    contains(id: Identifier){
        return this.positive.contains(id)
            || (id.inComb() && this.negative.contains(id));
    }

    isSubset(other: PermissionSet){
        return this.positive.isSubset(other.positive)
            && this.negative.isSuperset(other.negative);
    }

    union(other: Support): Support{
        if(other instanceof PermissionSet){
            let positive = this.positive.union(other.positive),
                negative = this.negative.intersect(other.negative);
            return new PermissionSet(positive, negative);
        }

        else{
            return this.addAll(other);
        }
    }

    add(id: Identifier): PermissionSet{
        if(id.inComb()) {
            return new PermissionSet(this.positive, this.negative.remove(id));
        }else{
            return new PermissionSet(this.positive.add(id), this.negative);
        }
    }

    addAll(ids: Set<Identifier>): PermissionSet {
        // add elements to the positive set that are NOT in the comb
        let positive = this.positive.union(ids.filterNot(inComb));

        // remove elements from the negative set that are in the comb
        let negative = this.negative.subtract(ids.filter(inComb));

        return new PermissionSet(positive, negative);
    }

    remove(id: Identifier): PermissionSet {
        if(id.inComb()) {
            return new PermissionSet(this.positive, this.negative.add(id));
        }else{
            return new PermissionSet(this.positive.remove(id), this.negative);
        }
    }

    removeAll(ids: Set<Identifier>): PermissionSet {
        // remove elements to the positive set that are NOT in the comb
        let positive = this.positive.subtract(ids.filterNot(inComb));

        // add elements from the negative set that are in the comb
        let negative = this.negative.union(ids.filter(inComb));

        return new PermissionSet(positive, negative);
    }

    report(): any{
        return {positive: this.positive.toJS(), negative: this.negative.toJS()};
    }
}*/