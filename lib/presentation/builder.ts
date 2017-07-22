/**
 * Epistemic status: very low, really needs a rework
 * @module presentation/builder
 */

import {Options, SubSup, BinRel, Fence, Field, Op, OrdPunct} from "./markup";
import {Selector} from "../nominal/navigate";
import {Hole, Template} from "./template";

export type Optional = Options & SubSup<Hole>;

/**
 * We use this class to conveniently build Templates.
 */
export class Builder{
    static hole(selector: Selector, roles: Array<string> = []): Hole{
        return {kind: "hole", selector, roles};
    }

    static ord(nucleus: Template, options: Optional = {}): OrdPunct<Hole>{
        let ord: OrdPunct<Hole> = {kind: "ord", nucleus};
        return Object.assign(ord, options);
    }

    static punct(nucleus: Template, options: Optional = {}): OrdPunct<Hole>{
        let punct: OrdPunct<Hole> = {kind: "punct", nucleus};
        return Object.assign(punct, options);
    }

    static op(nucleus: Template, options: Optional = {}): Op<Hole> {
        let op: Op<Hole> = {kind: "op", nucleus};
        return Object.assign(op, options);
    }

    static bin(left: Template, nucleus: Template, right: Template, options: Optional = {}): BinRel<Hole>{
        let bin: BinRel<Hole> = {kind: "bin", nucleus, left, right};
        return Object.assign(bin, options);
    }

    static rel(left: Template, nucleus: Template, right: Template, options: Optional = {}): BinRel<Hole>{
        let rel: BinRel<Hole> = {kind: "rel", nucleus, left, right};
        return Object.assign(rel, options);
    }

    static fence(open: string, inner: Template, close: string, options: Optional = {}): Fence<Hole>{
        let fence: Fence<Hole> = {kind: "fence", open, inner, close};
        return Object.assign(fence, options);
    }
}
