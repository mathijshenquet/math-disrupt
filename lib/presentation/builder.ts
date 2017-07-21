/**
 * Epistemic status: very low, really needs a rework
 * @module presentation/builder
 */

import {BinRel, Fence, Field, Op, OrdPunct} from "./index";
import {Hole, Options, SubSup} from "./atoms";
import {Cursor, Selector} from "../nominal/navigate";

/**
 * We use this class to conveniently build MathLists using the append
 * function this allows concatenation or adding null elements.
 *
 * @param S - The type of symbols
 */
export class Builder{
    static hole(selector: Selector, roles: Array<string> = []): Hole{
        return {kind: "hole", selector, roles};
    }

    static ord(nucleus: Field, options: Options & SubSup = {}): OrdPunct{
        let ord: OrdPunct = {kind: "ord", nucleus};
        return Object.assign(ord, options);
    }

    static punct(nucleus: Field, options: Options & SubSup = {}): OrdPunct{
        let punct: OrdPunct = {kind: "punct", nucleus};
        return Object.assign(punct, options);
    }

    static op(nucleus: Field, inner: Field, options: Options & SubSup = {}): Op {
        let op: Op = {kind: "op", nucleus, inner};
        return Object.assign(op, options);
    }

    static bin(left: Field, nucleus: Field, right: Field, options: Options & SubSup = {}): BinRel{
        let bin: BinRel = {kind: "bin", nucleus, left, right};
        return Object.assign(bin, options);
    }

    static rel(left: Field, nucleus: Field, right: Field, options: Options & SubSup = {}): BinRel{
        let rel: BinRel = {kind: "rel", nucleus, left, right};
        return Object.assign(rel, options);
    }

    static fence(open: string, inner: Field, close: string, options: Options & SubSup = {}){
        let fence: Fence = {kind: "fence", open, inner, close};
        return Object.assign(fence, options);
    }
}
