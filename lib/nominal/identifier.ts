
import {hash} from "immutable";

// TODO: ugly hack, lets hope we can use immutable v4 quickly
declare module "immutable"{
    function hash(value: any): number;
}

export function Id(name: string, shift: number = 0){
    return new Identifier(name, shift);
}

/**
 * To ensure names are always freshly pickable each name has an associated shift
 * for example if x is already bound in some expression X, then if we want to
 * bind x again, the x already bound in X will get shifted one spot which we
 * will write as x'. To make these shifts well behaved (invertible) we also
 * allow negative shift levels.
 */
export class Identifier {
    equals(other: Identifier): boolean {
        return this.base === other.base && this.shift === other.shift;
    }

    hashCode(): number {
        return hash(this.base) ^ hash(this.shift);
    }

    readonly base: string;
    readonly shift: number;

    constructor(name: string, shift: number){
        this.base = name;
        this.shift = shift;
    }

    inComb(): boolean{
        return this.shift <= 0;
    }

    rename(name: string): Identifier {
        return Id(name, this.shift);
    }

    shiftBy(amount: number): Identifier {
        return Id(this.base, this.shift + amount);
    }

    toString(){
        return this.base + "'".repeat(this.shift);
    }
}