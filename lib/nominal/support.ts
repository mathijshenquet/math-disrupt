/**
 * @module nominal/support
 */

import {Map, Set} from "immutable";
import {Permutation, Swap, Shift} from "./permutation";
import {Identifier} from "./identifier";

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

    support(): SupportSet {
        return new SupportSet(Set(), this.shifts);
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