/**
 * Epistemic status: very low, really needs a rework
 * @module presentation/builder
 */

import {
    MathList, Atom, BinRel, Fence, Field, Op, OrdPunct, Dec,
    Augmented
} from "./markup";
import {FontVariant} from "./misc";
import {Term} from "../nominal/terms";

/**
 * We use this class to conveniently build MathLists using the append
 * function this allows concatenation or adding null elements.
 *
 * @param S - The type of symbols
 */
export class Builder<T>{
    private items: MathList<T>;
    private stack: Array<MathList<T>>;
    private cursor: MathList<T>;

    constructor(){
        this.items = [];
        this.cursor = this.items;
        this.stack = [];
    }

    build(): MathList<T> | Atom<T>{
        if(this.items.length == 1)
            return this.items[0];
        return this.items;
    }

    item(item: Atom<T>){
        this.cursor.push(item);
    }

    push(inner: MathList<T> = []){
        this.stack.push(this.cursor);
        this.cursor = inner;
    }

    pop(): MathList<T>{
        let cursor = this.stack.pop();
        if(cursor === undefined){
            console.log(this);
            throw new Error("Cannot pop sublist, bottom of stack reached");
        }

        const inner = this.cursor;
        this.cursor = cursor;
        return inner;
    }

    symbol(nucleus: string){
        let ord = new OrdPunct<T>("ord", nucleus);
        ord.variant = "normal";
        this.item(ord);
    }

    ord(nucleus: string, variant?: FontVariant){
        let ord = new OrdPunct<T>("ord", nucleus);
        if(variant) ord.variant = variant;
        this.item(ord);
        return ord;
    }

    punct(nucleus: string){
        this.item(new OrdPunct<T>("punct", nucleus));
    }

    op(nucleus: string, inner: Field<T>): Op<T> {
        let op = new Op<T>("op", nucleus, inner);
        this.item(op);
        return op;
    }

    bin(nucleus: string, left: Field<T>, right: Field<T>){
        this.item(new BinRel("bin", nucleus, left, right));
    }

    rel(nucleus: string, left: Field<T>, right: Field<T>){
        this.item(new BinRel("rel", nucleus, left, right));
    }

    fence(left: string, inner: Field<T>, right: string){
        this.item(new Fence(left, right, inner));
    }

    overline(inner: Field<T>){
        this.item(new Dec("over", inner));
    }
}
