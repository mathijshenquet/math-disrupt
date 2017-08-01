/**
 * @module nominal/support
 */

import {Map, Set} from "immutable";
import {Permutation, Swap, Shift} from "./permutation";
import {Identifier} from "./identifier";
import {Bind, Form, Term, Composite} from "./term";
import {Unknown} from "./unknown";

const maxMerger = (a: number, b: number) => Math.max(a, b);

/**
 * A nominal term will be supported by a SupportSet consisting of a finite and
 * infinite part. The finite part is strict meaning that if for some term t,
 * x \in sup(t)_fin then there is no substitution \theta such that
 * x \not\in sup(\theta(t))_fin. For the infinite part this does not hold.
 *
 * The infinite part is called a permission set in the literature.
 */
export class SupportSet{
    readonly finite: Set<Identifier>;
    readonly infinite?: Map<string, number>;

    constructor(finite: Set<Identifier>, infinite?: Map<string, number>){
        this.finite = finite;
        this.infinite = infinite;
    }

    inInfinitePart(id: Identifier){
        // infinite part is empty
        if(this.infinite === undefined) return false;

        // check if the shift is not too high
        return id.shift <= this.infinite.get(id.base, 0);
    }

    contains(id: Identifier){
        return this.finite.contains(id) || this.inInfinitePart(id);
    }

    union(other: SupportSet): SupportSet{
        if(!this.infinite){
            if(other.infinite)
                return other.union(this);

            else
                return new SupportSet(this.finite.union(other.finite));
        }

        let finite = this.finite.union(other.finite);
        let infinite = this.infinite;
        if(other.infinite)
            infinite = infinite.mergeWith(maxMerger, other.infinite);

        return new SupportSet(finite, infinite);
    }

    remove(id: Identifier): SupportSet {
        let finite = this.finite.remove(id);

        if(!this.infinite)
            return new SupportSet(finite);

        else
            return new SupportSet(finite,
                this.infinite.set(id.base, id.shift-1));
    }

    report(){
        let out: any = {finite: this.finite.toJS()}
        if(this.infinite) out.infinite = this.infinite.toJS();
        return out;
    }
}

export function support(term: Term): SupportSet{
    if(term instanceof Identifier)
        return new SupportSet(Set([term]));

    else if(term instanceof Unknown)
        return new SupportSet(Set(), term.pms.shifts);

    else if(term instanceof Form)
        return support(term.argument);

    else if(term instanceof Composite)
        return term.elements.reduce(
            (collection, item) => collection.union(support(item))
            , new SupportSet(Set())
        );

    else if(term instanceof Bind)
        return support(term.term).remove(term.name);

    else
        throw new Error("Unreachable in #support");
}